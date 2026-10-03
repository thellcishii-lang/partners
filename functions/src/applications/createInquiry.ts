import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, FV, REGION } from '../lib/admin';
import { COLLECTIONS } from '../lib/constants';

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new HttpsError('invalid-argument', '応募情報の形式が正しくありません。');
  }
  return value as Record<string, unknown>;
}

function text(data: Record<string, unknown>, key: string, max: number, required = false): string {
  const value = data[key];
  if (typeof value !== 'string' || value.trim().length > max || (required && !value.trim())) {
    throw new HttpsError('invalid-argument', `${key}の入力を確認してください。`);
  }
  return value.trim();
}

export const createInquiry = onCall({ region: REGION }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'ログインしてください。');
  const auth = request.auth;
  const data = object(request.data);
  const inquiryId = text(data, 'inquiryId', 20, true);
  const listingId = text(data, 'listingId', 1500, true);
  if (!/^[a-zA-Z0-9]{20}$/.test(inquiryId) || listingId.includes('/')) {
    throw new HttpsError('invalid-argument', '案件・応募IDが正しくありません。');
  }
  const details = {
    fullName: text(data, 'fullName', 120, true),
    kana: text(data, 'kana', 120),
    email: text(data, 'email', 254, true),
    phone: text(data, 'phone', 50),
    lineId: text(data, 'lineId', 100),
    message: text(data, 'message', 5000, true),
  };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) {
    throw new HttpsError('invalid-argument', 'メールアドレスを確認してください。');
  }
  const preview = object(data.maskedPreview);
  if (typeof preview.hasExperience !== 'boolean') {
    throw new HttpsError('invalid-argument', '経験の有無を選択してください。');
  }
  const maskedPreview = {
    prefecture: text(preview, 'prefecture', 50),
    ageRange: text(preview, 'ageRange', 50),
    budget: text(preview, 'budget', 100),
    hasExperience: preview.hasExperience,
  };
  const applicantId = auth.uid;
  const inqRef = db.collection(COLLECTIONS.INQUIRIES).doc(inquiryId);
  const detailRef = db.collection(COLLECTIONS.INQUIRY_DETAILS).doc(inquiryId);
  const listingRef = db.collection(COLLECTIONS.LISTINGS).doc(listingId);
  const applicantRef = db.collection(COLLECTIONS.APPLICANTS).doc(applicantId);

  await db.runTransaction(async (tx) => {
    const [existing, listingSnap, applicantSnap] = await Promise.all([
      tx.get(inqRef), tx.get(listingRef), tx.get(applicantRef),
    ]);
    // 応答が失われた場合の再送で二重応募・二重課金しない。
    if (existing.exists) {
      if (existing.get('applicantId') !== applicantId || existing.get('listingId') !== listingId) {
        throw new HttpsError('already-exists', '応募IDは既に使用されています。');
      }
      return;
    }
    if (!listingSnap.exists || listingSnap.get('status') !== 'published') {
      throw new HttpsError('failed-precondition', 'この案件は現在応募を受け付けていません。');
    }
    const advertiserId: unknown = listingSnap.get('advertiserId');
    if (typeof advertiserId !== 'string' || !advertiserId || advertiserId.includes('/')) {
      throw new HttpsError('failed-precondition', '募集者情報が正しくありません。');
    }
    if (advertiserId === applicantId) {
      throw new HttpsError('failed-precondition', '自分の案件には応募できません。');
    }
    const advRef = db.collection(COLLECTIONS.ADVERTISERS).doc(advertiserId);
    const advSnap = await tx.get(advRef);
    if (!advSnap.exists) throw new HttpsError('failed-precondition', '募集者が見つかりません。');

    tx.create(inqRef, {
      listingId,
      advertiserId,
      applicantId,
      status: 'pending',
      maskedPreview,
      depositTransactionId: null,
      deliveredAt: null,
      createdAt: FV.serverTimestamp(),
    });
    tx.create(detailRef, {
      inquiryId,
      applicantId,
      advertiserId,
      ...details,
      snapshot: applicantSnap.exists ? applicantSnap.data() : {
        displayName: details.fullName,
        email: auth.token.email ?? details.email,
      },
      createdAt: FV.serverTimestamp(),
    });
    tx.update(advRef, { pendingCount: FV.increment(1), updatedAt: FV.serverTimestamp() });
  });
  return { inquiryId };
});
