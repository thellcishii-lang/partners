const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');

const projectId = 'demo-partners';
if (process.env.GCLOUD_PROJECT !== projectId || !process.env.FIRESTORE_EMULATOR_HOST ||
    !process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  throw new Error('Run these tests with the demo-partners Auth/Firestore/Functions emulators.');
}
// stripeWebhook ハンドラをプロセス内で呼ぶためのテスト用署名シークレット
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_deposit';
const Stripe = require('stripe');
const { getFirestore } = require('firebase-admin/firestore');
const { creditsForAmount } = require('../lib/depositPricing');
const { allowedReturnOrigin } = require('../lib/payments/createDepositCheckout');
const { stripeWebhook } = require('../lib/payments/stripeWebhook');

const admin = getFirestore();
const authHost = `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}`;
const functionsBase = `http://127.0.0.1:5001/${projectId}/asia-northeast1`;
const origin = 'http://localhost:3000';

async function signUp(email) {
  const res = await fetch(`${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password: 'test-password', returnSecureToken: true }),
  });
  const body = await res.json();
  assert.ok(body.idToken, JSON.stringify(body));
  return { uid: body.localId, token: body.idToken, email };
}

async function call(name, user, data, headers = { origin }) {
  const res = await fetch(`${functionsBase}/${name}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(user ? { authorization: `Bearer ${user.token}` } : {}), ...headers },
    body: JSON.stringify({ data }),
  });
  return res.json();
}

async function until(read, expected, label) {
  const deadline = Date.now() + 30000;
  let value;
  while (Date.now() < deadline) {
    value = await read();
    if (value === expected) return;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  assert.fail(`${label}: expected ${expected}, got ${value}`);
}

function webhookRequest(event, secret = process.env.STRIPE_WEBHOOK_SECRET) {
  const payload = JSON.stringify(event);
  const signature = new Stripe('sk_unused').webhooks.generateTestHeaderString({ payload, secret });
  const res = { statusCode: 200, body: undefined };
  res.status = (code) => { res.statusCode = code; return res; };
  res.send = (body) => { res.body = body; return res; };
  res.json = (body) => { res.body = body; return res; };
  const req = {
    method: 'POST', rawBody: Buffer.from(payload), body: event, headers: { 'stripe-signature': signature },
    get: (name) => (name.toLowerCase() === 'stripe-signature' ? signature : undefined),
  };
  return { req, res };
}

function checkoutEvent(orderId, advertiserId, amount, type = 'checkout.session.completed') {
  return {
    id: `evt_${randomUUID().replace(/-/g, '')}`, object: 'event', type,
    data: { object: {
      id: `cs_test_${orderId}`, object: 'checkout.session', client_reference_id: orderId,
      metadata: { orderId, advertiserId }, currency: 'jpy', amount_total: amount,
      payment_status: 'paid', payment_intent: 'pi_test_123',
    } },
  };
}

test('deposit amounts follow the 2,500 yen unit price', () => {
  assert.equal(creditsForAmount(10000), 4);
  assert.equal(creditsForAmount(30000), 12);
  assert.equal(creditsForAmount(32500), 13);
  assert.equal(creditsForAmount(2500000), 1000);
  for (const invalid of [0, 2500, 12500, 27500, 31000, 2502500, 10000.5, '10000', null]) {
    assert.equal(creditsForAmount(invalid), null, String(invalid));
  }
});

test('checkout return origins are allowlisted', () => {
  assert.equal(allowedReturnOrigin('http://localhost:3000', true), 'http://localhost:3000');
  assert.equal(allowedReturnOrigin('https://abc-3000.app.github.dev', true), 'https://abc-3000.app.github.dev');
  assert.equal(allowedReturnOrigin('https://evil.example', true), null);
  assert.equal(allowedReturnOrigin('http://abc-3000.app.github.dev', true), null);
  assert.equal(allowedReturnOrigin('http://localhost:3000/path', true), null);
  assert.equal(allowedReturnOrigin('http://localhost:3000', false), null);
});

test('deposit purchase grants credits and releases held inquiries', { timeout: 120000 }, async (t) => {
  const suffix = randomUUID().slice(0, 8);
  const owner = await signUp(`deposit-owner-${suffix}@example.com`);
  const applicant = await signUp(`deposit-applicant-${suffix}@example.com`);
  const advRef = admin.doc(`advertisers/${owner.uid}`);
  const listingRef = admin.collection('listings').doc();
  const created = [advRef, listingRef];
  const balance = async () => (await advRef.get()).get('depositBalance');
  try {
    await advRef.set({ companyName: 'Deposit Co', email: owner.email, depositBalance: 0, pendingCount: 0, lowDepositNotified: null });
    await listingRef.set({ advertiserId: owner.uid, companyName: 'Deposit Co', title: 'Deposit listing', status: 'published' });
    const inquiryId = admin.collection('inquiries').doc().id;
    created.push(admin.doc(`inquiries/${inquiryId}`), admin.doc(`inquiryDetails/${inquiryId}`));
    const applied = await call('createInquiry', applicant, {
      inquiryId, listingId: listingRef.id, fullName: 'Applicant', kana: '', email: applicant.email,
      phone: '', lineId: '', message: 'Hello',
      maskedPreview: { prefecture: '', ageRange: '', budget: '', hasExperience: false },
    });
    assert.ok(applied.result, JSON.stringify(applied));
    await until(async () => (await advRef.get()).get('pendingCount'), 1, 'held inquiry');

    await t.test('invalid requests are rejected without creating orders', async () => {
      assert.equal((await call('createDepositCheckout', null, { amountJpy: 10000 })).error.status, 'UNAUTHENTICATED');
      for (const amountJpy of [5000, 31000, 2502500, '10000']) {
        assert.equal((await call('createDepositCheckout', owner, { amountJpy })).error.status, 'INVALID_ARGUMENT');
      }
      assert.equal((await call('createDepositCheckout', owner, { amountJpy: 10000 }, { origin: 'https://evil.example' }))
        .error.status, 'FAILED_PRECONDITION');
      assert.equal((await call('createDepositCheckout', applicant, { amountJpy: 10000 })).error.status, 'FAILED_PRECONDITION');
      const orders = await admin.collection('depositOrders').where('advertiserId', 'in', [owner.uid, applicant.uid]).get();
      assert.equal(orders.size, 0);
    });

    await t.test('emulator without a Stripe key simulates payment and releases the held inquiry', async () => {
      const result = (await call('createDepositCheckout', owner, { amountJpy: 10000 })).result;
      assert.equal(result.simulated, true);
      assert.equal(result.url, `${origin}/deposit/complete?orderId=${result.orderId}`);
      const orderRef = admin.doc(`depositOrders/${result.orderId}`);
      created.push(orderRef);
      const order = await orderRef.get();
      assert.equal(order.get('status'), 'paid');
      assert.equal(order.get('credits'), 4);
      assert.equal(order.get('priceJpy'), 10000);
      await until(async () => (await admin.doc(`inquiries/${inquiryId}`).get()).get('status'), 'delivered', 'released');
      await until(balance, 3, 'balance after purchase and release');
    });

    await t.test('signed Stripe webhook marks the order paid exactly once', async () => {
      const orderRef = admin.collection('depositOrders').doc();
      created.push(orderRef);
      await orderRef.set({ advertiserId: owner.uid, credits: 12, priceJpy: 30000, status: 'pending', paidAt: null });

      const forged = webhookRequest(checkoutEvent(orderRef.id, owner.uid, 30000), 'whsec_wrong');
      await stripeWebhook(forged.req, forged.res);
      assert.equal(forged.res.statusCode, 400);

      const mismatch = webhookRequest(checkoutEvent(orderRef.id, owner.uid, 2500));
      await stripeWebhook(mismatch.req, mismatch.res);
      assert.equal(mismatch.res.body.outcome, 'mismatch');
      assert.equal((await orderRef.get()).get('status'), 'pending');

      const event = checkoutEvent(orderRef.id, owner.uid, 30000);
      const first = webhookRequest(event);
      await stripeWebhook(first.req, first.res);
      assert.equal(first.res.statusCode, 200);
      assert.equal(first.res.body.outcome, 'paid');
      await until(balance, 15, 'balance after webhook');

      const retry = webhookRequest(event);
      await stripeWebhook(retry.req, retry.res);
      assert.equal(retry.res.body.outcome, 'already-paid');
      await new Promise((resolve) => setTimeout(resolve, 1500));
      assert.equal(await balance(), 15);
      assert.equal((await orderRef.get()).get('stripePaymentIntentId'), 'pi_test_123');
    });

    await t.test('expired checkout cancels a pending order', async () => {
      const orderRef = admin.collection('depositOrders').doc();
      created.push(orderRef);
      await orderRef.set({ advertiserId: owner.uid, credits: 4, priceJpy: 10000, status: 'pending', paidAt: null });
      const expired = webhookRequest(checkoutEvent(orderRef.id, owner.uid, 10000, 'checkout.session.expired'));
      await stripeWebhook(expired.req, expired.res);
      assert.equal(expired.res.body.outcome, 'expired');
      assert.equal((await orderRef.get()).get('status'), 'canceled');
    });
  } finally {
    for (const collection of ['depositTransactions', 'mailLogs']) {
      for (const field of ['advertiserId', 'params.advertiserId']) {
        const docs = await admin.collection(collection).where(field, '==', owner.uid).get();
        created.push(...docs.docs.map((snap) => snap.ref));
      }
    }
    await Promise.all(created.map((ref) => ref.delete()));
    for (const user of [owner, applicant]) {
      await fetch(`${authHost}/identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:delete`, {
        method: 'POST', headers: { authorization: 'Bearer owner', 'content-type': 'application/json' },
        body: JSON.stringify({ localId: user.uid }),
      });
    }
  }
});
