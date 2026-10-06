import { onCall, HttpsError } from 'firebase-functions/v2/https';
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

// reviewing → draft に戻す。理由は reviewNote に残す。
export const rejectListing = onCall({ region: REGION }, async (request) => {
  await requireAdmin(request);
  const data = (request.data ?? {}) as Record<string, unknown>;
  const listingId = text(data, 'listingId', 1500, true);
  const reason = text(data, 'reason', 500);
  if (listingId.includes('/')) {
    throw new HttpsError('invalid-argument', '案件IDが正しくありません。');
  }

  const listingRef = db.collection(COLLECTIONS.LISTINGS).doc(listingId);

  const outcome = await db.runTransaction(async (tx) => {
    const snap = await tx.get(listingRef);
    if (!snap.exists) throw new HttpsError('not-found', '案件が見つかりません。');
    const status: unknown = snap.get('status');
    if (status === 'draft') return { changed: false as const };
    if (status !== 'reviewing') {
      throw new HttpsError('failed-precondition', '審査中の案件のみ却下できます。');
    }
    tx.update(listingRef, {
      status: 'draft',
      reviewNote: reason || null,
      updatedAt: FV.serverTimestamp(),
    });
    return { changed: true as const, advertiserId: snap.get('advertiserId') as unknown };
  });

  if (outcome.changed && typeof outcome.advertiserId === 'string' && !outcome.advertiserId.includes('/')) {
    const advSnap = await db.collection(COLLECTIONS.ADVERTISERS).doc(outcome.advertiserId).get();
    const email = advSnap.data()?.email;
    if (typeof email === 'string' && email) {
      await enqueueMail('LISTING_REJECTED', email, {
        listingId,
        advertiserId: outcome.advertiserId,
        reason,
      });
    }
  }

  return { listingId, rejected: true };
});
