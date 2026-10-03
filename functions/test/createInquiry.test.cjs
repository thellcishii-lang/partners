const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { initializeApp: initializeAdmin } = require('firebase-admin/app');
const { getFirestore: getAdminFirestore } = require('firebase-admin/firestore');
const { initializeApp, deleteApp } = require('../../web/node_modules/firebase/app');
const { getAuth, connectAuthEmulator, createUserWithEmailAndPassword } = require('../../web/node_modules/firebase/auth');
const {
  getFirestore, connectFirestoreEmulator, doc, collection, setDoc, getDoc,
  getDocs, query, where, updateDoc, serverTimestamp, terminate,
} = require('../../web/node_modules/firebase/firestore');
const { getFunctions, connectFunctionsEmulator, httpsCallable } = require('../../web/node_modules/firebase/functions');

const projectId = 'demo-partners';
if (process.env.GCLOUD_PROJECT !== projectId || !process.env.FIRESTORE_EMULATOR_HOST ||
    !process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  throw new Error('Run these tests with the isolated demo-partners Auth/Firestore/Functions emulators.');
}
const admin = getAdminFirestore(initializeAdmin({ projectId }));

function client(name) {
  const app = initializeApp({ projectId, apiKey: 'demo-key', appId: 'demo-app' }, name);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const functions = getFunctions(app, 'asia-northeast1');
  connectAuthEmulator(auth, `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}`, { disableWarnings: true });
  const [host, port] = process.env.FIRESTORE_EMULATOR_HOST.split(':');
  connectFirestoreEmulator(db, host, Number(port));
  connectFunctionsEmulator(functions, '127.0.0.1', 5001);
  return { app, auth, db, createInquiry: httpsCallable(functions, 'createInquiry') };
}

async function waitForStatus(id, expected) {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    const snap = await admin.doc(`inquiries/${id}`).get();
    if (snap.get('status') === expected) return snap;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  assert.fail(`Inquiry ${id} did not reach ${expected}`);
}

test('listing and application integration', { timeout: 120000 }, async (t) => {
  const suffix = randomUUID();
  const owner = client(`owner-${suffix}`);
  const applicant = client(`applicant-${suffix}`);
  const guest = client(`guest-${suffix}`);
  const created = [];
  try {
    const ownerUser = (await createUserWithEmailAndPassword(owner.auth, `owner-${suffix}@example.com`, 'test-password')).user;
    const applicantUser = (await createUserWithEmailAndPassword(applicant.auth, `applicant-${suffix}@example.com`, 'test-password')).user;
    const advRef = admin.doc(`advertisers/${ownerUser.uid}`);
    await advRef.set({
      companyName: 'Integration Company', email: ownerUser.email,
      depositBalance: 2, pendingCount: 0, lowDepositNotified: null,
    });
    created.push(advRef.path);
    await admin.doc(`applicants/${applicantUser.uid}`).set({ displayName: 'Applicant', email: applicantUser.email });
    created.push(`applicants/${applicantUser.uid}`);
    const listingRef = doc(collection(owner.db, 'listings'));
    created.push(listingRef.path);

    await t.test('owner saves draft and review; anonymous sees only published listings', async () => {
      await setDoc(listingRef, {
        advertiserId: ownerUser.uid, companyName: 'Integration Company',
        title: 'Test listing', category: '代理店', description: 'Description',
        requirements: '', reward: 'Commission', initialCost: '', royalty: '', area: '全国',
        images: [], status: 'draft', publishedAt: null,
        createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      });
      assert.equal((await getDoc(listingRef)).get('status'), 'draft');
      const invalidListing = doc(collection(owner.db, 'listings'));
      await assert.rejects(setDoc(invalidListing, {
        advertiserId: ownerUser.uid, status: 'draft', title: 'a'.repeat(121),
      }), { code: 'permission-denied' });
      await assert.rejects(getDoc(doc(guest.db, listingRef.path)), { code: 'permission-denied' });
      await updateDoc(listingRef, { status: 'reviewing' });
      await assert.rejects(updateDoc(listingRef, { status: 'published' }), { code: 'permission-denied' });
      await admin.doc(listingRef.path).update({ status: 'published' });
      const published = await getDocs(query(collection(guest.db, 'listings'), where('status', '==', 'published')));
      assert.ok(published.docs.some((snap) => snap.id === listingRef.id));
      assert.equal((await getDoc(doc(guest.db, listingRef.path))).get('companyName'), 'Integration Company');
    });

    function input() {
      const inquiryId = doc(collection(applicant.db, 'inquiries')).id;
      created.push(`inquiries/${inquiryId}`, `inquiryDetails/${inquiryId}`);
      return {
        inquiryId, listingId: listingRef.id, fullName: 'Applicant', kana: 'アプリカント',
        email: applicantUser.email, phone: '09000000000', lineId: '', message: 'Application motivation',
        maskedPreview: { prefecture: '東京都', ageRange: '30代', budget: '100万円', hasExperience: true },
      };
    }

    await t.test('authentication and validation are enforced', async () => {
      await assert.rejects(guest.createInquiry(input()), { code: 'functions/unauthenticated' });
      await assert.rejects(applicant.createInquiry({ ...input(), message: '   ' }), { code: 'functions/invalid-argument' });
      await assert.rejects(applicant.createInquiry({
        ...input(), maskedPreview: { prefecture: '', ageRange: '', budget: '', hasExperience: 'yes' },
      }), { code: 'functions/invalid-argument' });
      await assert.rejects(owner.createInquiry(input()), { code: 'functions/failed-precondition' });
      await admin.doc(listingRef.path).update({ status: 'draft' });
      const rejected = input();
      await assert.rejects(applicant.createInquiry(rejected), { code: 'functions/failed-precondition' });
      assert.equal((await admin.doc(`inquiries/${rejected.inquiryId}`).get()).exists, false);
      assert.equal((await admin.doc(`inquiryDetails/${rejected.inquiryId}`).get()).exists, false);
      await admin.doc(listingRef.path).update({ status: 'published' });
    });

    await t.test('atomic creation triggers delivery and retry does not charge again', async () => {
      const data = input();
      await assert.rejects(setDoc(doc(applicant.db, 'inquiryDetails', data.inquiryId), {
        applicantId: applicantUser.uid, fullName: data.fullName,
      }), { code: 'permission-denied' });
      const result = await applicant.createInquiry({ ...data, advertiserId: 'forged-recipient', applicantId: ownerUser.uid });
      assert.equal(result.data.inquiryId, data.inquiryId);
      const delivered = await waitForStatus(data.inquiryId, 'delivered');
      assert.equal(delivered.get('applicantId'), applicantUser.uid);
      assert.equal(delivered.get('advertiserId'), ownerUser.uid);
      assert.ok(delivered.get('depositTransactionId'));
      assert.ok(delivered.get('deliveredAt'));
      assert.deepEqual(delivered.get('maskedPreview'), data.maskedPreview);
      const details = await getDoc(doc(applicant.db, 'inquiryDetails', data.inquiryId));
      assert.equal(details.get('fullName'), data.fullName);
      assert.equal(details.get('inquiryId'), data.inquiryId);
      assert.equal(details.get('snapshot').displayName, 'Applicant');
      assert.equal((await advRef.get()).get('depositBalance'), 1);
      assert.equal((await advRef.get()).get('pendingCount'), 0);
      await applicant.createInquiry(data);
      await assert.rejects(owner.createInquiry(data), { code: 'functions/already-exists' });
      assert.equal((await advRef.get()).get('depositBalance'), 1);
      assert.equal((await getDoc(doc(owner.db, 'inquiryDetails', data.inquiryId))).get('message'), data.message);
      await assert.rejects(setDoc(doc(applicant.db, 'inquiryDetails', data.inquiryId), { fullName: 'Changed' }), { code: 'permission-denied' });
    });

    await t.test('zero-credit application remains pending and details stay private', async () => {
      await advRef.update({ depositBalance: 0 });
      const data = input();
      await applicant.createInquiry(data);
      // Wait for the trigger's no-balance notification, not only the initial pending write.
      const deadline = Date.now() + 30000;
      let notified = false;
      while (Date.now() < deadline) {
        const mail = await admin.collection('mailLogs').where('params.inquiryId', '==', data.inquiryId).get();
        notified = mail.docs.some((snap) => snap.get('template') === 'INQUIRY_HELD_NO_DEPOSIT');
        if (notified) break;
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
      assert.ok(notified, 'onInquiryCreated must run for a held inquiry');
      const pending = await admin.doc(`inquiries/${data.inquiryId}`).get();
      assert.equal(pending.get('status'), 'pending');
      assert.equal(pending.get('depositTransactionId'), null);
      assert.equal(pending.get('deliveredAt'), null);
      assert.equal((await advRef.get()).get('pendingCount'), 1);
      await assert.rejects(getDoc(doc(owner.db, 'inquiryDetails', data.inquiryId)), { code: 'permission-denied' });
      assert.equal((await getDoc(doc(applicant.db, 'inquiryDetails', data.inquiryId))).exists(), true);
      await applicant.createInquiry(data);
      assert.equal((await advRef.get()).get('pendingCount'), 1);
    });
  } finally {
    const inquiryIds = created.filter((path) => path.startsWith('inquiries/')).map((path) => path.split('/')[1]);
    for (const id of inquiryIds) {
      for (const collectionName of ['depositTransactions', 'mailLogs']) {
        const field = collectionName === 'mailLogs' ? 'params.inquiryId' : 'inquiryId';
        const docs = await admin.collection(collectionName).where(field, '==', id).get();
        await Promise.all(docs.docs.map((snap) => snap.ref.delete()));
      }
      for (const path of created.filter((path) => path.startsWith('advertisers/'))) {
        const docs = await admin.collection('mailLogs').where('params.advertiserId', '==', path.split('/')[1]).get();
        await Promise.all(docs.docs.map((snap) => snap.ref.delete()));
      }
    }
    await Promise.all(created.map((path) => admin.doc(path).delete()));
    await Promise.all([owner, applicant, guest].map(async ({ app, db }) => { await terminate(db); await deleteApp(app); }));
  }
});
