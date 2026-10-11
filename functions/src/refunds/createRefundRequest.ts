import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { db, FV, REGION } from '../lib/admin';
import { COLLECTIONS } from '../lib/constants';
import { UNIT_PRICE_JPY } from '../depositPricing';
import { enqueueMail } from '../lib/mail';

const REFUND_FEE_JPY = 550;

function text(data: Record<string, unknown>, key: string, max: number, required = true): string {
  const value = data[key];
  if (typeof value !== 'string' || value.trim().length > max || (required && !value.trim())) {
    throw new HttpsError('invalid-argument', `${key}の入力を確認してください。`);
  }
  return value.trim();
}

export const createRefundRequest = onCall({ region: REGION }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'ログインしてください。');
  const advertiserId = request.auth.uid;
  const data = (request.data ?? {}) as Record<string, unknown>;

  const bankName = text(data, 'bankName', 100);
  const branchName = text(data, 'branchName', 100);
  const accountType = text(data, 'accountType', 20);
  const accountNumber = text(data, 'accountNumber', 20);
  const accountHolder = text(data, 'accountHolder', 100);

  if (!['普通', '当座'].includes(accountType)) {
    throw new HttpsError('invalid-argument', '口座種別が正しくありません。');
  }
  if (!/^[0-9]{7,8}$/.test(accountNumber)) {
    throw new HttpsError('invalid-argument', '口座番号は7〜8桁の数字で入力してください。');
  }

  const advRef = db.collection(COLLECTIONS.ADVERTISERS).doc(advertiserId);

  const result = await db.runTransaction(async (tx) => {
    const advSnap = await tx.get(advRef);
    if (!advSnap.exists) throw new HttpsError('failed-precondition', '募集者プロフィールがありません。');

    const adv = advSnap.data()!;
    const balance = (adv.depositBalance ?? 0) as number;
    if (balance <= 0) {
      throw new HttpsError('failed-precondition', '返金可能な残高がありません。');
    }
    if (adv.refundRequestedAt) {
      throw new HttpsError('failed-precondition', '既に返金申請済みです。');
    }

    const amountYen = balance * UNIT_PRICE_JPY;
    if (amountYen <= REFUND_FEE_JPY) {
      throw new HttpsError('failed-precondition', '返金額が手数料を下回るため申請できません。');
    }
    const netAmountYen = amountYen - REFUND_FEE_JPY;

    const reqRef = db.collection('refundRequests').doc();
    tx.set(reqRef, {
      advertiserId,
      amountYen,
      feeYen: REFUND_FEE_JPY,
      netAmountYen,
      bankInfo: { bankName, branchName, accountType, accountNumber, accountHolder },
      status: 'pending',
      requestedAt: FV.serverTimestamp(),
      completedAt: null,
      operatorId: null,
      note: null,
    });

    tx.update(advRef, {
      refundRequestedAt: FV.serverTimestamp(),
      updatedAt: FV.serverTimestamp(),
    });

    return {
      requestId: reqRef.id,
      amountYen,
      netAmountYen,
      advertiserName: (adv.companyName ?? '') as string,
      email: (adv.email ?? '') as string,
      depositBalance: balance,
    };
  });

  // 管理者へ通知
  const adminSnap = await db
    .collection(COLLECTIONS.USERS)
    .where('role', '==', 'admin')
    .limit(5)
    .get();
  const adminEmails = adminSnap.docs
    .map((d) => d.get('email'))
    .filter((e): e is string => typeof e === 'string' && !!e);

  for (const email of adminEmails) {
    await enqueueMail('REFUND_REQUESTED', email, {
      advertiserId,
      requestId: result.requestId,
      advertiserName: result.advertiserName,
      email: result.email,
      amountYen: result.amountYen,
      feeYen: REFUND_FEE_JPY,
      netAmountYen: result.netAmountYen,
      bankName,
      branchName,
      accountType,
      accountNumber,
      accountHolder,
    });
  }

  logger.info('createRefundRequest done', { advertiserId, requestId: result.requestId });
  return { requestId: result.requestId };
});
