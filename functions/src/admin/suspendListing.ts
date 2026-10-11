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

// 管理者による公開停止（募集者は再公開できない）
export const suspendListing = onCall({ region: REGION }, async (request) => {
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
    if (snap.get('adminSuspended') === true) {
      throw new HttpsError('failed-precondition', '既に公開停止中です。');
    }
    tx.update(listingRef, {
      adminSuspended: true,
      status: 'paused',
      reviewNote: reason || null,
      updatedAt: FV.serverTimestamp(),
    });
  });

  return { listingId, suspended: true };
});

// 管理者による公開停止の解除（募集者が再公開できるようになる）
export const unsuspendListing = onCall({ region: REGION }, async (request) => {
  await requireAdmin(request);
  const data = (request.data ?? {}) as Record<string, unknown>;
  const listingId = text(data, 'listingId', 1500, true);
  if (listingId.includes('/')) {
    throw new HttpsError('invalid-argument', '案件IDが正しくありません。');
  }

  const listingRef = db.collection(COLLECTIONS.LISTINGS).doc(listingId);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(listingRef);
    if (!snap.exists) throw new HttpsError('not-found', '案件が見つかりません。');
    if (snap.get('adminSuspended') !== true) {
      throw new HttpsError('failed-precondition', '公開停止中ではありません。');
    }
    tx.update(listingRef, {
      adminSuspended: false,
      reviewNote: null,
      updatedAt: FV.serverTimestamp(),
    });
  });

  return { listingId, suspended: false };
});
