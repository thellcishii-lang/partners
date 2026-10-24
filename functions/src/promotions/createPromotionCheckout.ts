import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { db, FV, REGION } from '../lib/admin';
import { COLLECTIONS } from '../lib/constants';
import { isEmulator, stripeClient, STRIPE_SECRET_KEY } from '../lib/stripe';

const TOP_PRICE_JPY = 55000;
const RECOMMEND_PRICE_JPY = 33000;
const EXPERT_TOP_PRICE_JPY = 35000;      
const EXPERT_RECOMMEND_PRICE_JPY = 18000;
const TAX_RATE = 0.1;
const TOP_SLOTS = 5;
const RECOMMEND_SLOTS = 10;

function withTax(amount: number): number {
  return Math.floor(amount * (1 + TAX_RATE));
}

function allowedReturnOrigin(origin: unknown, emulator = isEmulator()): string | null {
  if (typeof origin !== 'string') return null;
  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    return null;
  }
  if (url.origin !== origin) return null;
  const configured = (process.env.APP_ORIGINS ?? '').split(',').map((v) => v.trim()).filter(Boolean);
  if (configured.includes(origin)) return origin;
  if (!emulator) return null;
  const local = url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname);
  const codespaces = url.protocol === 'https:' && url.hostname.endsWith('.app.github.dev');
  return local || codespaces ? origin : null;
}

export const createPromotionCheckout = onCall(
  { region: REGION, secrets: [STRIPE_SECRET_KEY] },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'ログインしてください。');
    const advertiserId = request.auth.uid;
    const data = (request.data ?? {}) as Record<string, unknown>;

    const plan = data.plan;
    if (plan !== 'top' && plan !== 'recommend') {
      throw new HttpsError('invalid-argument', 'プランが正しくありません。');
    }
    const billingType = data.billingType;
    if (billingType !== 'one_time' && billingType !== 'subscription') {
      throw new HttpsError('invalid-argument', '課金タイプが正しくありません。');
    }
    const listingId = data.listingId;
    if (typeof listingId !== 'string' || !listingId || listingId.includes('/')) {
      throw new HttpsError('invalid-argument', '案件IDが正しくありません。');
    }
    const startAtRaw = data.startAt;
    if (typeof startAtRaw !== 'string') {
      throw new HttpsError('invalid-argument', '開始日を指定してください。');
    }
    const startAt = new Date(startAtRaw);
    if (Number.isNaN(startAt.getTime())) {
      throw new HttpsError('invalid-argument', '開始日の形式が正しくありません。');
    }
    const now = new Date();
    if (startAt.getTime() < now.getTime() - 60 * 1000) {
      throw new HttpsError('invalid-argument', '開始日は本日以降を指定してください。');
    }
    const oneYear = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    if (startAt.getTime() > oneYear.getTime()) {
      throw new HttpsError('invalid-argument', '開始日は1年以内で指定してください。');
    }

    const origin = allowedReturnOrigin(request.rawRequest.headers.origin);
    if (!origin) throw new HttpsError('failed-precondition', 'このサイトからは決済を開始できません。');

    // 案件の所有者チェック
    const listingSnap = await db.collection(COLLECTIONS.LISTINGS).doc(listingId).get();
    if (!listingSnap.exists) {
      throw new HttpsError('not-found', '案件が見つかりません。');
    }
    if (listingSnap.get('advertiserId') !== advertiserId) {
      throw new HttpsError('permission-denied', 'この案件の権限がありません。');
    }
    const status = listingSnap.get('status');
    if (status !== 'published') {
      throw new HttpsError('failed-precondition', '公開中の案件のみおすすめ表示できます。');
    }

    // 既に同じプランで active な契約がないか
    const existingSnap = await db
      .collection('listingPromotions')
      .where('listingId', '==', listingId)
      .where('plan', '==', plan)
      .where('status', 'in', ['pending', 'active'])
      .limit(1)
      .get();
    if (!existingSnap.empty) {
      throw new HttpsError('failed-precondition', 'この案件は既に同じプランを契約中です。');
    }

    // 満枠チェック（アクティブ or pending の数で判定）
    const slotCountSnap = await db
      .collection('listingPromotions')
      .where('plan', '==', plan)
      .where('status', 'in', ['pending', 'active'])
      .count()
      .get();
    const slots = plan === 'top' ? TOP_SLOTS : RECOMMEND_SLOTS;
    if (slotCountSnap.data().count >= slots) {
      throw new HttpsError('failed-precondition', '現在、枠が満杯です。空きが出るまでお待ちください。');
    }

    const priceJpy = plan === 'top' ? TOP_PRICE_JPY : RECOMMEND_PRICE_JPY;
    const totalJpy = withTax(priceJpy);

    const advSnap = await db.collection(COLLECTIONS.ADVERTISERS).doc(advertiserId).get();
    if (!advSnap.exists) throw new HttpsError('failed-precondition', '募集者プロフィールがありません。');

    const stripe = stripeClient();
    if (!stripe && !isEmulator()) {
      logger.error('STRIPE_SECRET_KEY is not configured');
      throw new HttpsError('failed-precondition', '決済の設定が完了していません。');
    }

    const promotionRef = db.collection('listingPromotions').doc();
    const successUrl = `${origin}/promotions/complete?promotionId=${promotionRef.id}`;
    await promotionRef.set({
      advertiserId,
      listingId,
      plan,
      priceJpy,
      totalJpy,
      taxRate: TAX_RATE,
      billingType,
      startAt,
      endAt: billingType === 'one_time'
        ? new Date(startAt.getTime() + 30 * 24 * 60 * 60 * 1000)
        : null,
      status: 'pending',
      stripeSessionId: null,
      stripeSubscriptionId: null,
      paidAt: null,
      createdAt: FV.serverTimestamp(),
      updatedAt: FV.serverTimestamp(),
    });

    if (!stripe) {
      await promotionRef.update({ status: 'active', paidAt: FV.serverTimestamp() });
      return { promotionId: promotionRef.id, url: successUrl, simulated: true };
    }

    try {
      const planLabel = plan === 'top' ? '上部表示' : 'おすすめ表示';
      const session = await stripe.checkout.sessions.create({
        mode: billingType === 'subscription' ? 'subscription' : 'payment',
        client_reference_id: promotionRef.id,
        customer_email: advSnap.get('email') || undefined,
        line_items: [{
          quantity: 1,
          price_data: {
            currency: 'jpy',
            unit_amount: totalJpy,
            ...(billingType === 'subscription'
              ? {
                  recurring: { interval: 'month' },
                }
              : {}),
            product_data: { name: `${planLabel}（月額・税込）` },
          },
        }],
        metadata: {
          type: 'promotion',
          promotionId: promotionRef.id,
          advertiserId,
          listingId,
          plan,
          billingType,
        },
        ...(billingType === 'one_time'
          ? { payment_intent_data: { metadata: { type: 'promotion', promotionId: promotionRef.id } } }
          : { subscription_data: { metadata: { type: 'promotion', promotionId: promotionRef.id } } }),
        success_url: successUrl,
        cancel_url: `${origin}/promotions?canceled=1`,
      }, { idempotencyKey: `promotion-${promotionRef.id}` });

      await promotionRef.update({ stripeSessionId: session.id });
      if (!session.url) throw new Error('Checkout session has no URL');
      return { promotionId: promotionRef.id, url: session.url, simulated: false };
    } catch (error) {
      logger.error('Promotion Checkout session creation failed', {
        promotionId: promotionRef.id,
        error,
      });
      await promotionRef.update({ status: 'canceled' });
      throw new HttpsError('unavailable', '決済ページを作成できませんでした。');
    }
  },
);
