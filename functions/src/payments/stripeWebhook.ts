import Stripe from 'stripe';
import { onRequest } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { db, FV, REGION } from '../lib/admin';
import { COLLECTIONS } from '../lib/constants';
import { STRIPE_WEBHOOK_SECRET } from '../lib/stripe';

type Outcome = 'paid' | 'already-paid' | 'expired' | 'ignored' | 'mismatch' | 'not-found';

// Checkout の結果を depositOrders に反映する。paid への更新で onDepositOrderPaid が残高を加算する。
export async function applyCheckoutEvent(event: Stripe.Event): Promise<Outcome> {
  const paidEvent = event.type === 'checkout.session.completed' ||
    event.type === 'checkout.session.async_payment_succeeded';
  const expiredEvent = event.type === 'checkout.session.expired' ||
    event.type === 'checkout.session.async_payment_failed';
  if (!paidEvent && !expiredEvent) return 'ignored';

  const session = event.data.object as Stripe.Checkout.Session;
  const orderId = session.metadata?.orderId || session.client_reference_id;
  if (!orderId || orderId.includes('/')) return 'not-found';
  if (paidEvent && session.payment_status !== 'paid') return 'ignored';

  const orderRef = db.collection(COLLECTIONS.DEPOSIT_ORDERS).doc(orderId);
  return db.runTransaction(async (tx) => {
    const order = await tx.get(orderRef);
    if (!order.exists) return 'not-found';
    if (order.get('status') === 'paid') return 'already-paid';
    if (order.get('status') !== 'pending') return 'ignored';
    if (expiredEvent) {
      tx.update(orderRef, { status: 'canceled', stripeSessionId: session.id });
      return 'expired';
    }
    if (session.currency !== 'jpy' || session.amount_total !== order.get('priceJpy') ||
        (session.metadata?.advertiserId && session.metadata.advertiserId !== order.get('advertiserId'))) {
      return 'mismatch';
    }
    const paymentIntent = typeof session.payment_intent === 'string'
      ? session.payment_intent : session.payment_intent?.id ?? null;
    tx.update(orderRef, {
      status: 'paid',
      paidAt: FV.serverTimestamp(),
      stripeSessionId: session.id,
      stripePaymentIntentId: paymentIntent,
      stripeEventId: event.id,
    });
    return 'paid';
  });
}

export const stripeWebhook = onRequest(
  { region: REGION, secrets: [STRIPE_WEBHOOK_SECRET] },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }
    const webhookSecret = STRIPE_WEBHOOK_SECRET.value();
    const signature = req.get('stripe-signature');
    if (!webhookSecret || !signature) {
      res.status(400).send('Webhook is not configured or signature is missing');
      return;
    }
    let event: Stripe.Event;
    try {
      event = Stripe.webhooks.constructEvent(req.rawBody, signature, webhookSecret);
    } catch (error) {
      logger.warn('Invalid Stripe webhook signature', { error });
      res.status(400).send('Invalid signature');
      return;
    }
    try {
      const outcome = await applyCheckoutEvent(event);
      if (outcome === 'mismatch' || outcome === 'not-found') {
        logger.error('Stripe checkout does not match a deposit order', { eventId: event.id, outcome });
      }
      res.json({ received: true, outcome });
    } catch (error) {
      logger.error('Stripe webhook processing failed', { eventId: event.id, error });
      res.status(500).send('Processing failed');
    }
  },
);
