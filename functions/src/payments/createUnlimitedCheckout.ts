import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { db, FV, REGION } from '../lib/admin';
import { COLLECTIONS } from '../lib/constants';
import { UNLIMITED_PRICE_JPY, UNLIMITED_DAYS, withTax } from '../depositPricing';
import { isEmulator, stripeClient, STRIPE_SECRET_KEY } from '../lib/stripe';

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

export const createUnlimitedCheckout = onCall(
  { region: REGION, secrets: [STRIPE_SECRET_KEY] },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'ログインしてください。');
    const advertiserId = request.auth.uid;
    const data = request.data as { startAt?: unknown } | null;
    const startAtRaw = data?.startAt;

    if (typeof startAtRaw !== 'string') {
      throw new HttpsError('invalid-argument', '開始日を指定してください。');
    }
    const startAt = new Date(startAtRaw);
    if (Number.isNaN(startAt.getTime())) {
      throw new HttpsError('invalid-argument', '開始日の形式が正しくありません。');
    }
    const now = new Date();
    // 過去日はNG、1年以内に制限
    if (startAt.getTime() < now.getTime() - 60 * 1000) {
      throw new HttpsError('invalid-argument', '開始日は本日以降を指定してください。');
    }
    const oneYear = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    if (startAt.getTime() > oneYear.getTime()) {
      throw new HttpsError('invalid-argument', '開始日は1年以内で指定してください。');
    }

    const endAt = new Date(startAt.getTime() + UNLIMITED_DAYS * 24 * 60 * 60 * 1000);

    const origin = allowedReturnOrigin(request.rawRequest.headers.origin);
    if (!origin) throw new HttpsError('failed-precondition', 'このサイトからは決済を開始できません。');

    const advSnap = await db.collection(COLLECTIONS.ADVERTISERS).doc(advertiserId).get();
    if (!advSnap.exists) throw new HttpsError('failed-precondition', '募集者プロフィールがありません。');

    const stripe = stripeClient();
    if (!stripe && !isEmulator()) {
      logger.error('STRIPE_SECRET_KEY is not configured');
      throw new HttpsError('failed-precondition', '決済の設定が完了していません。');
    }

    const orderRef = db.collection('unlimitedOrders').doc();
    const successUrl = `${origin}/unlimited/complete?orderId=${orderRef.id}`;
    const totalJpy = withTax(UNLIMITED_PRICE_JPY);
    await orderRef.set({
      advertiserId,
      priceJpy: UNLIMITED_PRICE_JPY,
      totalJpy,
      taxRate: 0.1,
      startAt,
      endAt,
      status: 'pending',
      provider: stripe ? 'stripe' : 'emulator',
      stripeSessionId: null,
      paidAt: null,
      createdAt: FV.serverTimestamp(),
    });

    if (!stripe) {
      await orderRef.update({ status: 'paid', paidAt: FV.serverTimestamp() });
      return { orderId: orderRef.id, url: successUrl, simulated: true };
    }

    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        client_reference_id: orderRef.id,
        customer_email: advSnap.get('email') || undefined,
        line_items: [{
          quantity: 1,
          price_data: {
            currency: 'jpy',
            unit_amount: totalJpy,
            product_data: { name: `${UNLIMITED_DAYS}日間 無制限プラン（税込）` },
          },
        }],
        metadata: { type: 'unlimited', orderId: orderRef.id, advertiserId },
        payment_intent_data: { metadata: { type: 'unlimited', orderId: orderRef.id, advertiserId } },
        success_url: successUrl,
        cancel_url: `${origin}/unlimited?canceled=1`,
      }, { idempotencyKey: `unlimited-order-${orderRef.id}` });
      await orderRef.update({ stripeSessionId: session.id });
      if (!session.url) throw new Error('Checkout session has no URL');
      return { orderId: orderRef.id, url: session.url, simulated: false };
    } catch (error) {
      logger.error('Stripe Checkout session creation failed (unlimited)', { orderId: orderRef.id, error });
      await orderRef.update({ status: 'failed' });
      throw new HttpsError('unavailable', '決済ページを作成できませんでした。');
    }
  },
);
