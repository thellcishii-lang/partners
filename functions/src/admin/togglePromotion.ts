import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, FV, REGION } from '../lib/admin';
import { COLLECTIONS } from '../lib/constants';
import { requireAdmin } from '../lib/roles';

function text(data: Record<string, unknown>, key: string, max: number, required = true): string {
  const value = data[key];
  if (typeof value !== 'string' || value.trim().length > max || (required && !value.trim())) {
    throw new HttpsError('invalid-argument', `${key}の入力を確認してください。`);
  }
  return value.trim();
}

// 管理者が手動で上部表示 / おすすめ表示をON/OFFする
export const togglePromotion = onCall({ region: REGION }, async (request) => {
  await requireAdmin(request);
  const data = (request.data ?? {}) as Record<string, unknown>;
  const listingId = text(data, 'listingId', 1500, true);
  const plan = text(data, 'plan', 20, true);
  const enabled = data.enabled === true;

  if (listingId.includes('/')) {
    throw new HttpsError('invalid-argument', '案件IDが正しくありません。');
  }
  if (plan !== 'top' && plan !== 'recommend') {
    throw new HttpsError('invalid-argument', 'プランが正しくありません。');
  }

  const listingRef = db.collection(COLLECTIONS.LISTINGS).doc(listingId);
  const snap = await listingRef.get();
  if (!snap.exists) throw new HttpsError('not-found', '案件が見つかりません。');

  const update: Record<string, unknown> = {
    updatedAt: FV.serverTimestamp(),
  };

  if (plan === 'top') {
    update.isPromotedTop = enabled;
    if (!enabled) update.promotedTopUntil = null;
  } else {
    update.isPromotedRecommend = enabled;
    if (!enabled) update.promotedRecommendUntil = null;
  }

  await listingRef.update(update);

  return { listingId, plan, enabled };
});
