import { db, FV, TS, REGION } from './lib/admin';
import { COLLECTIONS, LOW_DEPOSIT_THRESHOLD } from './lib/constants';
import { enqueueMail } from './lib/mail';

// ============================================================
// 型
// ============================================================
export type ConsumeResult =
  | { delivered: true; balanceAfter: number; txId: string; notifyLow: boolean }
  | { delivered: false; balanceAfter: 0; reason: 'no_balance' | 'already_processed' };

// ============================================================
// consumeOne
//   1デポジット消費して inquiry を delivered に昇格する。
//   既に delivered なら何もしない（冪等）。
//   残高0なら pending のまま false を返す。
// ============================================================
export async function consumeOne(
  advertiserId: string,
  inquiryId: string,
  opts: { reason?: string } = {}
): Promise<ConsumeResult> {
  const advRef = db.collection(COLLECTIONS.ADVERTISERS).doc(advertiserId);
  const inqRef = db.collection(COLLECTIONS.INQUIRIES).doc(inquiryId);
  const txRef = db.collection(COLLECTIONS.DEPOSIT_TX).doc();

  return db.runTransaction(async (tx) => {
    const [advSnap, inqSnap] = await Promise.all([tx.get(advRef), tx.get(inqRef)]);

    if (!advSnap.exists) throw new Error(`advertiser not found: ${advertiserId}`);
    if (!inqSnap.exists) throw new Error(`inquiry not found: ${inquiryId}`);

    const adv = advSnap.data()!;
    const inq = inqSnap.data()!;

    // 冪等ガード：既に開示済みなら何もしない
    if (inq.status === 'delivered' || inq.status === 'won' || inq.status === 'lost') {
      return { delivered: false, balanceAfter: adv.depositBalance ?? 0, reason: 'already_processed' };
    }
    // キャンセル・期限切れも消費しない
    if (inq.status === 'cancelled' || inq.status === 'expired') {
      return { delivered: false, balanceAfter: adv.depositBalance ?? 0, reason: 'already_processed' };
    }

    const balance = (adv.depositBalance ?? 0) as number;

    // 残高ゼロ → 保留のまま
    if (balance <= 0) {
      return { delivered: false, balanceAfter: 0, reason: 'no_balance' };
    }

    const balanceAfter = balance - 1;
    const now = TS.now();

    // 通知フラグ判定
    //   - 残3以下 かつ 0より大きい かつ この残数でまだ通知していない
    const shouldNotifyLow =
      balanceAfter > 0 &&
      balanceAfter <= LOW_DEPOSIT_THRESHOLD &&
      adv.lowDepositNotified !== balanceAfter;

    // 1) advertiser 残高更新
    const advUpdate: Record<string, unknown> = {
      depositBalance: FV.increment(-1),
      updatedAt: now,
    };
    if (shouldNotifyLow) {
      advUpdate.lowDepositNotified = balanceAfter;
    }
    // pendingCount を減らす（delivered に昇格する時のみ）
    if (inq.status === 'pending') {
      advUpdate.pendingCount = FV.increment(-1);
    }
    tx.update(advRef, advUpdate);

    // 2) 台帳記録（追記のみ）
    tx.set(txRef, {
      advertiserId,
      type: 'consume',
      amount: -1,
      balanceAfter,
      reason: opts.reason ?? `inquiry:${inquiryId}`,
      inquiryId,
      createdAt: now,
    });

    // 3) inquiry を delivered へ
    tx.update(inqRef, {
      status: 'delivered',
      deliveredAt: now,
      depositTransactionId: txRef.id,
      updatedAt: now,
    });

    return {
      delivered: true as const,
      balanceAfter,
      txId: txRef.id,
      notifyLow: shouldNotifyLow,
    };
  });
}

// ============================================================
// releasePending
//   残高がある限り、古い pending を delivered に昇格する。
//   入金直後・無料付与直後に呼ぶ。
//   ※ 同時実行されてもトランザクションで安全
// ============================================================
export async function releasePending(advertiserId: string): Promise<{
  released: string[];
  remainingPending: number;
  balanceAfter: number;
}> {
  const released: string[] = [];
  const MAX_LOOP = 100; // 暴走防止

  for (let i = 0; i < MAX_LOOP; i++) {
    // 一番古い pending を1件取る
    const q = await db.collection(COLLECTIONS.INQUIRIES)
      .where('advertiserId', '==', advertiserId)
      .where('status', '==', 'pending')
      .orderBy('createdAt', 'asc')
      .limit(1)
      .get();

    if (q.empty) break;

    const inquiryId = q.docs[0].id;
    const result = await consumeOne(advertiserId, inquiryId, {
      reason: `release_pending:${inquiryId}`,
    });

    if (!result.delivered) {
      // 残高切れ or 既処理
      break;
    }

    released.push(inquiryId);

    // 開示メール
    const adv = (await db.collection(COLLECTIONS.ADVERTISERS).doc(advertiserId).get()).data()!;
    await enqueueMail('INQUIRY_DELIVERED', adv.email, {
      inquiryId,
      advertiserId,
      balanceAfter: result.balanceAfter,
    });

    if (result.notifyLow) {
      await enqueueMail('DEPOSIT_LOW', adv.email, {
        advertiserId,
        balance: result.balanceAfter,
      });
    }
  }

  // 最終状態を取得
  const [advSnap, pendingCountSnap] = await Promise.all([
    db.collection(COLLECTIONS.ADVERTISERS).doc(advertiserId).get(),
    db.collection(COLLECTIONS.INQUIRIES)
      .where('advertiserId', '==', advertiserId)
      .where('status', '==', 'pending')
      .count()
      .get(),
  ]);

  return {
    released,
    remainingPending: pendingCountSnap.data().count,
    balanceAfter: advSnap.data()?.depositBalance ?? 0,
  };
}

// ============================================================
// grantDeposit
//   デポジット加算（購入 / 管理者付与 / 無料トライアル）
//   ※ Webhook か Admin 操作からのみ呼ぶ
// ============================================================
export async function grantDeposit(params: {
  advertiserId: string;
  amount: number;
  reason: 'stripe' | 'bank_transfer' | 'admin_grant' | 'free_trial' | 'refund';
  orderId?: string;
  operatorId?: string;
  note?: string;
}): Promise<{ balanceAfter: number; txId: string }> {
  const { advertiserId, amount, reason, orderId, operatorId, note } = params;
  if (amount <= 0) throw new Error('amount must be positive');

  const advRef = db.collection(COLLECTIONS.ADVERTISERS).doc(advertiserId);
  const txRef = db.collection(COLLECTIONS.DEPOSIT_TX).doc();

  return db.runTransaction(async (tx) => {
    const advSnap = await tx.get(advRef);
    if (!advSnap.exists) throw new Error(`advertiser not found: ${advertiserId}`);
    const adv = advSnap.data()!;
    const balanceAfter = ((adv.depositBalance ?? 0) as number) + amount;
    const now = TS.now();

    tx.update(advRef, {
      depositBalance: FV.increment(amount),
      // 購入時に低残高通知フラグをリセット（次のサイクルで通知できる）
      lowDepositNotified: null,
      updatedAt: now,
    });

    tx.set(txRef, {
      advertiserId,
      type: reason === 'refund' ? 'refund' : 'purchase',
      amount,
      balanceAfter,
      reason,
      orderId: orderId ?? null,
      operatorId: operatorId ?? null,
      note: note ?? null,
      createdAt: now,
    });

    return { balanceAfter, txId: txRef.id };
  });
}

// ============================================================
// refundDeposit
//   返金（マイナス加算）。残高不足なら例外。
// ============================================================
export async function refundDeposit(params: {
  advertiserId: string;
  amount: number;
  operatorId: string;
  note?: string;
}): Promise<{ balanceAfter: number; txId: string }> {
  const { advertiserId, amount, operatorId, note } = params;
  if (amount <= 0) throw new Error('amount must be positive');

  const advRef = db.collection(COLLECTIONS.ADVERTISERS).doc(advertiserId);
  const txRef = db.collection(COLLECTIONS.DEPOSIT_TX).doc();

  return db.runTransaction(async (tx) => {
    const advSnap = await tx.get(advRef);
    if (!advSnap.exists) throw new Error(`advertiser not found: ${advertiserId}`);
    const balance = (advSnap.data()!.depositBalance ?? 0) as number;
    if (balance < amount) throw new Error('insufficient balance for refund');

    const balanceAfter = balance - amount;
    const now = TS.now();

    tx.update(advRef, {
      depositBalance: FV.increment(-amount),
      updatedAt: now,
    });

    tx.set(txRef, {
      advertiserId,
      type: 'refund',
      amount: -amount,
      balanceAfter,
      reason: 'refund',
      operatorId,
      note: note ?? null,
      createdAt: now,
    });

    return { balanceAfter, txId: txRef.id };
  });
}
