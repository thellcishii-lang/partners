import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, FV, REGION } from '../lib/admin';
import { COLLECTIONS } from '../lib/constants';
import { requireAdmin } from '../lib/roles';

function text(data: Record<string, unknown>, key: string, max: number, required = false): string {
  const value = data[key];
  if (typeof value !== 'string' || value.trim().length > max || (required && !value.trim())) {
    throw new HttpsError('invalid-argument', `${key}の入力を確認してください。`);
  }
  return value.trim();
}

// 管理者による募集終了（任意のstatus → closed）
export const forceCloseListing = onCall({ region: REGION }, async (request) => {
  await requireAdmin(request);
  const data = (request.data ?? {}) as Record<string, unknown>;
  const listingId = text(data, 'listingId', 1500, true);
  const reason = text(data, 'reason', 500);
  if (listingId.includes('/')) {
    throw new HttpsError('invalid-argument', '案件IDが正しくありません。');
  }

  const listingRef = db.collection(COLLECTIONS.LISTINGS).doc(listingId);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(listingRef);
    if (!snap.exists) throw new HttpsError('not-found', '案件が見つかりません。');
    const status: unknown = snap.get('status');
    if (status === 'closed') {
      throw new HttpsError('failed-precondition', '既に募集終了しています。');
    }
    tx.update(listingRef, {
      status: 'closed',
      reviewNote: reason || null,
      updatedAt: FV.serverTimestamp(),
    });
  });

  return { listingId, closed: true };
});
