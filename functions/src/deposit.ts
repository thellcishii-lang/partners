import { db, FV, TS } from './lib/admin';
import { COLLECTIONS, LOW_DEPOSIT_THRESHOLD } from './lib/constants';
import { enqueueMail } from './lib/mail';

// ============================================================
// 型
// ============================================================
export type ConsumeResult =
  | { delivered: true; balanceAfter: number; txId: string | null; notifyLow: boolean; freeTrial: boolean }
  | { delivered: false; balanceAfter: 0; reason: 'no_balance' | 'already_processed' };

// ============================================================
// 無料期間チェック
// ============================================================
function isInFreeTrial(freeUntil: unknown): boolean {
  if (!freeUntil) return false;
  if (typeof freeUntil === 'object' && freeUntil !== null && 'toDate' in freeUntil) {
    return (freeUntil as { toDate: () => Date }).toDate() > new Date();
  }
  if (freeUntil instanceof Date) return freeUntil > new Date();
  return false;
}

// ============================================================
// consumeOne
//   デポジット消費して inquiry を delivered に昇格する。
//   無料期間中は消費せず、そのまま delivered にする。
// ============================================================
export async function consumeOne(
  advertiserId: string,
  inquiryId: string,
  opts: { reason?: string } = {}
): Promise<ConsumeResult> {
  const advRef = db.collection(COLLECTIONS.ADVERTISERS).doc(advertiserId);
  const inqRef = db.collection(COLLECTIONS.INQUIRIES).doc(inquiryId);

  return db.runTransaction(async (tx) => {
    const [advSnap, inqSnap] = await Promise.all([tx.get(advRef), tx.get(inqRef)]);

    if (!advSnap.exists) throw new Error(`advertiser not found: ${advertiserId}`);
    if (!inqSnap.exists) throw new Error(`inquiry not found: ${inquiryId}`);

    const adv = advSnap.data()!;
    const inq = inqSnap.data()!;

    // 冪等ガード
    if (inq.status === 'delivered' || inq.status === 'won' || inq.status === 'lost') {
      return { delivered: false, balanceAfter: adv.depositBalance ?? 0, reason: 'already_processed' };
    }
    if (inq.status === 'cancelled' || inq.status === 'expired') {
      return { delivered: false, balanceAfter: adv.depositBalance ?? 0, reason: 'already_processed' };
    }

    const balance = (adv.depositBalance ?? 0) as number;
    const inFreeTrial = isInFreeTrial(adv.freeUntil);
    const now = TS.now();

    // ─── 無料期間中：消費せずに開示 ───
    if (inFreeTrial) {
      const advUpdate: Record<string, unknown> = { updatedAt: now };
      if (inq.status === 'pending') {
        advUpdate.pendingCount = FV.increment(-1);
      }
      tx.update(advRef, advUpdate);

      tx.update(inqRef, {
        status: 'delivered',
        deliveredAt: now,
        depositTransactionId: null,
        freeTrial: true,
        updatedAt: now,
      });

      return {
        delivered: true as const,
        balanceAfter: balance,
        txId: null,
        notifyLow: false,
        freeTrial: true,
      };
    }

    // ─── 無料期間外：通常消費 ───
    if (balance <= 0) {
      return { delivered: false, balanceAfter: 0, reason: 'no_balance' };
    }

    const txRef = db.collection(COLLECTIONS.DEPOSIT_TX).doc();
    const balanceAfter = balance - 1;

    const shouldNotifyLow =
      balanceAfter > 0 &&
      balanceAfter <= LOW_DEPOSIT_THRESHOLD &&
      adv.lowDepositNotified !== balanceAfter;

    const advUpdate: Record<string, unknown> = {
      depositBalance: FV.increment(-1),
      updatedAt: now,
    };
    if (shouldNotifyLow) {
      advUpdate.lowDepositNotified = balanceAfter;
    }
    if (inq.status === 'pending') {
      advUpdate.pendingCount = FV.increment(-1);
    }
    tx.update(advRef, advUpdate);

    tx.set(txRef, {
      advertiserId,
      type: 'consume',
      amount: -1,
      balanceAfter,
      reason: opts.reason ?? `inquiry:${inquiryId}`,
      inquiryId,
      createdAt: now,
    });

    tx.update(inqRef, {
      status: 'delivered',
      deliveredAt: now,
      depositTransactionId: txRef.id,
      freeTrial: false,
      updatedAt: now,
    });

    return {
      delivered: true as const,
      balanceAfter,
      txId: txRef.id,
      notifyLow: shouldNotifyLow,
      freeTrial: false,
    };
  });
}

// ============================================================
// releasePending
// ============================================================
export async function releasePending(advertiserId: string): Promise<{
  released: string[];
  remainingPending: number;
  balanceAfter: number;
}> {
  const released: string[] = [];
  const MAX_LOOP = 100;

  for (let i = 0; i < MAX_LOOP; i++) {
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

    if (!result.delivered) break;

    released.push(inquiryId);

    const adv = (await db.collection(COLLECTIONS.ADVERTISERS).doc(advertiserId).get()).data()!;
    await enqueueMail('INQUIRY_DELIVERED', adv.email, {
      inquiryId,
      advertiserId,
      balanceAfter: result.balanceAfter,
      freeTrial: result.freeTrial,
    });

    if (result.notifyLow) {
      await enqueueMail('DEPOSIT_LOW', adv.email, {
        advertiserId,
        balance: result.balanceAfter,
      });
    }
  }

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
// grantDeposit（変更なし）
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
// refundDeposit（変更なし）
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
