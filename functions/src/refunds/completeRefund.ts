import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { db, FV, REGION } from '../lib/admin';
import { COLLECTIONS } from '../lib/constants';
import { requireAdmin } from '../lib/roles';
import { enqueueMail } from '../lib/mail';

function text(data: Record<string, unknown>, key: string, max: number, required = false): string {
  const value = data[key];
  if (typeof value !== 'string' || value.trim().length > max || (required && !value.trim())) {
    throw new HttpsError('invalid-argument', `${key}の入力を確認してください。`);
  }
  return value.trim();
}

export const completeRefund = onCall({ region: REGION }, async (request) => {
  const operatorId = await requireAdmin(request);
  const data = (request.data ?? {}) as Record<string, unknown>;
  const requestId = text(data, 'requestId', 1500, true);
  const note = text(data, 'note', 500);
  if (requestId.includes('/')) {
    throw new HttpsError('invalid-argument', '申請IDが正しくありません。');
  }

  const reqRef = db.collection('refundRequests').doc(requestId);

  const outcome = await db.runTransaction(async (tx) => {
    const reqSnap = await tx.get(reqRef);
    if (!reqSnap.exists) throw new HttpsError('not-found', '返金申請が見つかりません。');
    if (reqSnap.get('status') === 'completed') {
      throw new HttpsError('failed-precondition', '既に完了しています。');
    }

    const advertiserId = reqSnap.get('advertiserId') as string;
    const amountYen = (reqSnap.get('amountYen') ?? 0) as number;
    const netAmountYen = (reqSnap.get('netAmountYen') ?? 0) as number;
    const bankInfo = reqSnap.get('bankInfo') as Record<string, string> | undefined;

    const advRef = db.collection(COLLECTIONS.ADVERTISERS).doc(advertiserId);
    const advSnap = await tx.get(advRef);
    if (!advSnap.exists) throw new HttpsError('failed-precondition', '募集者が見つかりません。');

    const adv = advSnap.data()!;
    const balance = (adv.depositBalance ?? 0) as number;
    if (balance <= 0) {
      throw new HttpsError('failed-precondition', '残高が0のため処理できません。');
    }
    const expectedAmountYen = balance * 2500;
    if (expectedAmountYen !== amountYen) {
      throw new HttpsError(
        'failed-precondition',
        '申請時の残高と現在の残高が異なります。申請を却下し、再申請を依頼してください。'
      );
    }

    const txRef = db.collection(COLLECTIONS.DEPOSIT_TX).doc();
    tx.set(txRef, {
      advertiserId,
      type: 'refund',
      amount: -balance,
      balanceAfter: 0,
      reason: 'refund',
      operatorId,
      note: note || null,
      createdAt: FV.serverTimestamp(),
    });

    tx.update(advRef, {
      depositBalance: 0,
      refundCompletedAt: FV.serverTimestamp(),
      updatedAt: FV.serverTimestamp(),
    });

    tx.update(reqRef, {
      status: 'completed',
      completedAt: FV.serverTimestamp(),
      operatorId,
      note: note || null,
    });

    return {
      advertiserId,
      advertiserName: (adv.companyName ?? '') as string,
      email: (adv.email ?? '') as string,
      netAmountYen,
      bankInfo: bankInfo ?? {},
    };
  });

  if (typeof outcome.email === 'string' && outcome.email) {
    await enqueueMail('REFUND_COMPLETED', outcome.email, {
      advertiserId: outcome.advertiserId,
      requestId,
      advertiserName: outcome.advertiserName,
      netAmountYen: outcome.netAmountYen,
      bankName: outcome.bankInfo.bankName ?? '',
      branchName: outcome.bankInfo.branchName ?? '',
      accountNumber: outcome.bankInfo.accountNumber ?? '',
    });
  }

  logger.info('completeRefund done', { requestId, advertiserId: outcome.advertiserId });
  return { requestId, completed: true };
});
