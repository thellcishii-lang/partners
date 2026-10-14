import Stripe from 'stripe';
import { onRequest } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { db, FV, REGION } from '../lib/admin';
import { COLLECTIONS } from '../lib/constants';
import { STRIPE_WEBHOOK_SECRET, webhookSecret } from '../lib/stripe';
import { enqueueMail } from '../lib/mail';

type Outcome =
  | 'paid' | 'already-paid' | 'expired' | 'ignored' | 'mismatch' | 'not-found'
  | 'subscription-updated' | 'subscription-deleted' | 'payment-failed';

// ============================================================
// Checkout セッション完了（1回払い / サブスク初回）
// ============================================================
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

  const isUnlimited = session.metadata?.type === 'unlimited';
  const isPromotion = session.metadata?.type === 'promotion';

  const orderRef = isUnlimited
    ? db.collection('unlimitedOrders').doc(orderId)
    : isPromotion
      ? db.collection('listingPromotions').doc(session.metadata?.promotionId ?? orderId)
      : db.collection(COLLECTIONS.DEPOSIT_ORDERS).doc(orderId);

  return db.runTransaction(async (tx) => {
    const order = await tx.get(orderRef);
    if (!order.exists) return 'not-found';
    if (order.get('status') === 'paid' || order.get('status') === 'active') return 'already-paid';
    if (order.get('status') !== 'pending') return 'ignored';
    if (expiredEvent) {
      tx.update(orderRef, { status: 'canceled', stripeSessionId: session.id });
      return 'expired';
    }
    if (session.currency !== 'jpy' || session.amount_total !== order.get('totalJpy') ||
        (session.metadata?.advertiserId && session.metadata.advertiserId !== order.get('advertiserId'))) {
      return 'mismatch';
    }
    const paymentIntent = typeof session.payment_intent === 'string'
      ? session.payment_intent : session.payment_intent?.id ?? null;
    const subscription = typeof session.subscription === 'string'
      ? session.subscription : session.subscription?.id ?? null;

    if (isPromotion) {
      tx.update(orderRef, {
        status: 'active',
        paidAt: FV.serverTimestamp(),
        stripeSessionId: session.id,
        stripePaymentIntentId: paymentIntent,
        stripeSubscriptionId: subscription,
        stripeEventId: event.id,
      });
    } else {
      tx.update(orderRef, {
        status: 'paid',
        paidAt: FV.serverTimestamp(),
        stripeSessionId: session.id,
        stripePaymentIntentId: paymentIntent,
        stripeEventId: event.id,
      });
    }
    return 'paid';
  });
}

// ============================================================
// サブスクリプションイベント
// ============================================================
async function findPromotionBySubscription(
  subscriptionId: string
): Promise<FirebaseFirestore.DocumentReference | null> {
  const snap = await db
    .collection('listingPromotions')
    .where('stripeSubscriptionId', '==', subscriptionId)
    .limit(1)
    .get();
  if (snap.empty) return null;
  return snap.docs[0].ref;
}

export async function applySubscriptionEvent(event: Stripe.Event): Promise<Outcome> {
  // ─── subscription.updated（期間更新） ───
  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription;
    const ref = await findPromotionBySubscription(subscription.id);
    if (!ref) return 'ignored';

    const snap = await ref.get();
    if (!snap.exists) return 'ignored';

    const promotionId = snap.id;
    const plan = snap.get('plan') as 'top' | 'recommend';
    const listingId = snap.get('listingId') as string;
    const advertiserId = snap.get('advertiserId') as string;

    const periodEnd = getSubscriptionPeriodEnd(subscription);
    if (!periodEnd) return 'ignored';
    const endAt = new Date(periodEnd * 1000);

    await ref.update({
      endAt,
      status: 'active',
      updatedAt: new Date(),
    });

    // 案件のフラグも更新
    const listingRef = db.collection(COLLECTIONS.LISTINGS).doc(listingId);
    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (plan === 'top') {
      update.isPromotedTop = true;
      update.promotedTopUntil = endAt;
    } else {
      update.isPromotedRecommend = true;
      update.promotedRecommendUntil = endAt;
    }
    await listingRef.update(update);

    // 更新メール（初回成功時はskipできるが、シンプルに送る）
    const advSnap = await db.collection(COLLECTIONS.ADVERTISERS).doc(advertiserId).get();
    const email = advSnap.get('email');
    const listingSnap = await listingRef.get();
    const listingTitle = (listingSnap.get('title') ?? '') as string;

    if (typeof email === 'string' && email) {
      await enqueueMail('PROMOTION_RENEWED', email, {
        advertiserId,
        promotionId,
        listingId,
        listingTitle,
        plan,
        planLabel: plan === 'top' ? '上部表示' : 'おすすめ表示',
        nextBillingAt: endAt.toISOString(),
      });
    }

    return 'subscription-updated';
  }

  // ─── subscription.deleted（解約） ───
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    const ref = await findPromotionBySubscription(subscription.id);
    if (!ref) return 'ignored';

    const snap = await ref.get();
    if (!snap.exists) return 'ignored';

    const promotionId = snap.id;
    const plan = snap.get('plan') as 'top' | 'recommend';
    const listingId = snap.get('listingId') as string;
    const advertiserId = snap.get('advertiserId') as string;

    await ref.update({
      status: 'expired',
      updatedAt: new Date(),
    });

    const listingRef = db.collection(COLLECTIONS.LISTINGS).doc(listingId);
    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (plan === 'top') {
      update.isPromotedTop = false;
      update.promotedTopUntil = null;
    } else {
      update.isPromotedRecommend = false;
      update.promotedRecommendUntil = null;
    }
    await listingRef.update(update);

    const advSnap = await db.collection(COLLECTIONS.ADVERTISERS).doc(advertiserId).get();
    const email = advSnap.get('email');
    const listingSnap = await listingRef.get();
    const listingTitle = (listingSnap.get('title') ?? '') as string;

    if (typeof email === 'string' && email) {
      await enqueueMail('PROMOTION_EXPIRED', email, {
        advertiserId,
        promotionId,
        listingId,
        listingTitle,
        plan,
        planLabel: plan === 'top' ? '上部表示' : 'おすすめ表示',
      });
    }

    return 'subscription-deleted';
  }

  // ─── invoice.payment_failed（支払い失敗） ───
  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionId = getInvoiceSubscriptionId(invoice);
    if (!subscriptionId) return 'ignored';

    const ref = await findPromotionBySubscription(subscriptionId);
    if (!ref) return 'ignored';

    const snap = await ref.get();
    if (!snap.exists) return 'ignored';

    const plan = snap.get('plan') as 'top' | 'recommend';
    const listingId = snap.get('listingId') as string;
    const advertiserId = snap.get('advertiserId') as string;

    const advSnap = await db.collection(COLLECTIONS.ADVERTISERS).doc(advertiserId).get();
    const email = advSnap.get('email');
    const listingSnap = await db.collection(COLLECTIONS.LISTINGS).doc(listingId).get();
    const listingTitle = (listingSnap.get('title') ?? '') as string;

    if (typeof email === 'string' && email) {
      await enqueueMail('PROMOTION_PAYMENT_FAILED', email, {
        advertiserId,
        promotionId: snap.id,
        listingId,
        listingTitle,
        plan,
        planLabel: plan === 'top' ? '上部表示' : 'おすすめ表示',
      });
    }

    return 'payment-failed';
  }

  return 'ignored';
}

// ============================================================
// ヘルパー
// ============================================================
function getSubscriptionPeriodEnd(subscription: Stripe.Subscription): number | null {
  // 新API: items.data[0].current_period_end
  const s = subscription as unknown as {
    current_period_end?: number;
    items?: { data?: { current_period_end?: number }[] };
  };
  if (typeof s.current_period_end === 'number') return s.current_period_end;
  if (s.items?.data?.[0]?.current_period_end) return s.items.data[0].current_period_end;
  return null;
}

function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const i = invoice as unknown as {
    subscription?: string | { id: string };
    parent?: { subscription_details?: { subscription?: string | { id: string } } };
  };
  const sub = i.subscription ?? i.parent?.subscription_details?.subscription;
  if (!sub) return null;
  return typeof sub === 'string' ? sub : sub.id;
}

// ============================================================
// Webhook ハンドラ
// ============================================================
export const stripeWebhook = onRequest(
  { region: REGION, secrets: [STRIPE_WEBHOOK_SECRET] },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }
    const secret = webhookSecret();
    const signature = req.get('stripe-signature');
    if (!secret || !signature) {
      res.status(400).send('Webhook is not configured or signature is missing');
      return;
    }
    let event: Stripe.Event;
    try {
      event = Stripe.webhooks.constructEvent(req.rawBody, signature, secret);
    } catch (error) {
      logger.warn('Invalid Stripe webhook signature', { error });
      res.status(400).send('Invalid signature');
      return;
    }
    try {
      // Checkout系
      const checkoutOutcome = await applyCheckoutEvent(event);
      // サブスク系
      const subOutcome = await applySubscriptionEvent(event);
      const outcome = checkoutOutcome !== 'ignored' ? checkoutOutcome : subOutcome;

      if (outcome === 'mismatch' || outcome === 'not-found') {
        logger.error('Stripe webhook does not match an order', { eventId: event.id, outcome });
      }
      res.json({ received: true, outcome });
    } catch (error) {
      logger.error('Stripe webhook processing failed', { eventId: event.id, error });
      res.status(500).send('Processing failed');
    }
  },
);
