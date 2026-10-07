import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';
import { db, REGION } from '../lib/admin';
import { COLLECTIONS } from '../lib/constants';

// SMS 認証完了後、カスタムクレーム smsVerified=true を付与する。
// クライアントからは smsVerified を直接書けないため、この関数経由が唯一の手段。
export const setSmsVerified = onCall({ region: REGION }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'ログインしてください。');
  }
  const uid = request.auth.uid;

  const userRecord = await getAuth().getUser(uid);
  if (!userRecord.phoneNumber) {
    throw new HttpsError('failed-precondition', '電話番号が確認できません。先にSMS認証を行ってください。');
  }

  // 既存のカスタムクレームを保持しつつ smsVerified を追加
  await getAuth().setCustomUserClaims(uid, {
    ...(userRecord.customClaims ?? {}),
    smsVerified: true,
    phoneNumber: userRecord.phoneNumber,
  });

  // Firestore にも記録（管理画面での参照用）
  const now = new Date();
  const [advSnap, appSnap] = await Promise.all([
    db.collection(COLLECTIONS.ADVERTISERS).doc(uid).get(),
    db.collection(COLLECTIONS.APPLICANTS).doc(uid).get(),
  ]);

  const updates: Promise<unknown>[] = [];
  if (advSnap.exists) {
    updates.push(
      db.collection(COLLECTIONS.ADVERTISERS).doc(uid).update({
        smsVerified: true,
        phone: userRecord.phoneNumber,
        updatedAt: now,
      }),
    );
  }
  if (appSnap.exists) {
    updates.push(
      db.collection(COLLECTIONS.APPLICANTS).doc(uid).update({
        smsVerified: true,
        phone: userRecord.phoneNumber,
        updatedAt: now,
      }),
    );
  }
  await Promise.all(updates);

  return { ok: true, phoneNumber: userRecord.phoneNumber };
});
