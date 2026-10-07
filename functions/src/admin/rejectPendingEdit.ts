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

// published の pendingEdit を破棄（旧内容のまま）
export const rejectPendingEdit = onCall({ region: REGION }, async (request) => {
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
    if (status !== 'published') {
      throw new HttpsError('failed-precondition', '公開中の案件のみ編集却下できます。');
    }
    const pendingEdit = snap.get('pendingEdit') as { submittedAt?: unknown } | null | undefined;
    if (!pendingEdit || !pendingEdit.submittedAt) {
      throw new HttpsError('failed-precondition', '編集審査中の案件ではありません。');
    }

    tx.update(listingRef, {
      pendingEdit: null,
      pendingEditSubmitted: false,
      reviewNote: reason || null,
      updatedAt: FV.serverTimestamp(),
    });

    return { advertiserId: snap.get('advertiserId') as unknown };
  });

  if (typeof outcome.advertiserId === 'string' && !outcome.advertiserId.includes('/')) {
    const advSnap = await db.collection(COLLECTIONS.ADVERTISERS).doc(outcome.advertiserId).get();
    const email = advSnap.data()?.email;
    if (typeof email === 'string' && email) {
      await enqueueMail('LISTING_EDIT_REJECTED', email, {
        listingId,
        advertiserId: outcome.advertiserId,
        reason,
      });
    }
  }

  return { listingId, rejected: true };
});
