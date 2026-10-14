import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { db, REGION } from '../lib/admin';
import { stripeClient, STRIPE_SECRET_KEY } from '../lib/stripe';

function text(data: Record<string, unknown>, key: string, max: number, required = true): string {
  const value = data[key];
  if (typeof value !== 'string' || value.trim().length > max || (required && !value.trim())) {
    throw new HttpsError('invalid-argument', `${key}の入力を確認してください。`);
  }
  return value.trim();
}

export const cancelPromotion = onCall(
  { region: REGION, secrets: [STRIPE_SECRET_KEY] },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'ログインしてください。');
    const advertiserId = request.auth.uid;
    const data = (request.data ?? {}) as Record<string, unknown>;
    const promotionId = text(data, 'promotionId', 1500, true);
    if (promotionId.includes('/')) {
      throw new HttpsError('invalid-argument', '契約IDが正しくありません。');
    }

    const ref = db.collection('listingPromotions').doc(promotionId);
    const snap = await ref.get();
    if (!snap.exists) throw new HttpsError('not-found', '契約が見つかりません。');
    if (snap.get('advertiserId') !== advertiserId) {
      throw new HttpsError('permission-denied', 'この契約の権限がありません。');
    }
    if (snap.get('status') !== 'active') {
      throw new HttpsError('failed-precondition', '契約中ではありません。');
    }
    if (snap.get('billingType') !== 'subscription') {
      throw new HttpsError('failed-precondition', 'サブスクリプション契約ではありません。');
    }

    const subscriptionId = snap.get('stripeSubscriptionId');
    if (typeof subscriptionId !== 'string' || !subscriptionId) {
      throw new HttpsError('failed-precondition', 'サブスクリプション情報が見つかりません。');
    }

    const stripe = stripeClient();
    if (!stripe) {
      throw new HttpsError('failed-precondition', '決済の設定が完了していません。');
    }

    try {
      // 期間終了時に解約（即時停止ではなく、現在の期間終了まで有効）
      await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });

      await ref.update({
        canceledAt: new Date(),
        updatedAt: new Date(),
      });

      logger.info('cancelPromotion done', { promotionId, advertiserId });
      return { promotionId, canceled: true };
    } catch (error) {
      logger.error('cancelPromotion failed', { promotionId, error });
      throw new HttpsError('unavailable', '解約処理に失敗しました。時間をおいて再度お試しください。');
    }
  },
);
