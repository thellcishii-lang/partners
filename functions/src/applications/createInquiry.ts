import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { createHash } from 'crypto';
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

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
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
    phone: text(data, 'phone', 50, true),
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

  const phoneHash = hash(normalizePhone(details.phone));
  const emailHash = hash(normalizeEmail(details.email));

  await db.runTransaction(async (tx) => {
    const [existing, listingSnap, applicantSnap] = await Promise.all([
      tx.get(inqRef), tx.get(listingRef), tx.get(applicantRef),
    ]);

    // 冪等：同じ inquiryId での再送
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

    // ─── 重複応募チェック（同じ案件 × 電話 or メール一致）───
    // 電話ハッシュ・メールハッシュで個別に検索
    const [byPhone, byEmail] = await Promise.all([
      tx.get(
        db.collection(COLLECTIONS.INQUIRIES)
          .where('listingId', '==', listingId)
          .where('applicantPhoneHash', '==', phoneHash)
          .limit(3)
      ),
      tx.get(
        db.collection(COLLECTIONS.INQUIRIES)
          .where('listingId', '==', listingId)
          .where('applicantEmailHash', '==', emailHash)
          .limit(3)
      ),
    ]);

    // 重複を除外して既存応募の ID セットを作る
    const existingIds = new Set<string>();
    byPhone.docs.forEach((d) => existingIds.add(d.id));
    byEmail.docs.forEach((d) => existingIds.add(d.id));
    const existingCount = existingIds.size;

    if (existingCount >= 2) {
      throw new HttpsError(
        'failed-precondition',
        'この電話番号とメールアドレスでは以前に申し込みがあったため、資料請求ができません。'
      );
    }
    const isRepeat = existingCount === 1;

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
      // 重複チェック用ハッシュ（PII は含まない）
      applicantPhoneHash: phoneHash,
      applicantEmailHash: emailHash,
      // 2回目の応募フラグ
      isRepeat,
      createdAt: FV.serverTimestamp(),
    });
    tx.create(detailRef, {
      inquiryId,
      applicantId,
      advertiserId,
      listingId,
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
