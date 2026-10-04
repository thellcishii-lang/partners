import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { db, FV, REGION } from '../lib/admin';
import { COLLECTIONS } from '../lib/constants';
import { creditsForAmount, UNIT_PRICE_JPY } from '../depositPricing';
import { isEmulator, stripeClient, STRIPE_SECRET_KEY } from '../lib/stripe';

// 決済後の戻り先。本番は functions/.env の APP_ORIGINS（カンマ区切り）に登録した Origin のみ許可。
export function allowedReturnOrigin(origin: unknown, emulator = isEmulator()): string | null {
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

export const createDepositCheckout = onCall(
  { region: REGION, secrets: [STRIPE_SECRET_KEY] },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'ログインしてください。');
    const advertiserId = request.auth.uid;
    const data = request.data as { amountJpy?: unknown } | null;
    const amountJpy = data?.amountJpy;
    const credits = creditsForAmount(amountJpy);
    if (credits === null) {
      throw new HttpsError('invalid-argument',
        '金額は 10,000円・30,000円、または 30,000円を超える 2,500円単位で指定してください。');
    }
    const priceJpy = amountJpy as number;
    const origin = allowedReturnOrigin(request.rawRequest.headers.origin);
    if (!origin) throw new HttpsError('failed-precondition', 'このサイトからは決済を開始できません。');

    const advSnap = await db.collection(COLLECTIONS.ADVERTISERS).doc(advertiserId).get();
    if (!advSnap.exists) throw new HttpsError('failed-precondition', '募集者プロフィールがありません。');

    const stripe = stripeClient();
    if (!stripe && !isEmulator()) {
      logger.error('STRIPE_SECRET_KEY is not configured');
      throw new HttpsError('failed-precondition', '決済の設定が完了していません。');
    }

    const orderRef = db.collection(COLLECTIONS.DEPOSIT_ORDERS).doc();
    const successUrl = `${origin}/deposit/complete?orderId=${orderRef.id}`;
    await orderRef.set({
      advertiserId,
      credits,
      priceJpy,
      unitPriceJpy: UNIT_PRICE_JPY,
      status: 'pending',
      provider: stripe ? 'stripe' : 'emulator',
      stripeSessionId: null,
      paidAt: null,
      createdAt: FV.serverTimestamp(),
    });

    if (!stripe) {
      // エミュレータで Stripe キー未設定のときだけ、決済成功を模擬して即時入金する。
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
            unit_amount: priceJpy,
            product_data: { name: `応募開示デポジット ${credits}件分` },
          },
        }],
        metadata: { orderId: orderRef.id, advertiserId },
        payment_intent_data: { metadata: { orderId: orderRef.id, advertiserId } },
        success_url: successUrl,
        cancel_url: `${origin}/deposit?canceled=1`,
      }, { idempotencyKey: `deposit-order-${orderRef.id}` });
      await orderRef.update({ stripeSessionId: session.id });
      if (!session.url) throw new Error('Checkout session has no URL');
      return { orderId: orderRef.id, url: session.url, simulated: false };
    } catch (error) {
      logger.error('Stripe Checkout session creation failed', { orderId: orderRef.id, error });
      await orderRef.update({ status: 'failed' });
      throw new HttpsError('unavailable', '決済ページを作成できませんでした。時間をおいて再度お試しください。');
    }
  },
);
