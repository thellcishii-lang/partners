import { HttpsError, type CallableRequest } from 'firebase-functions/v2/https';
import { db } from './admin';
import { COLLECTIONS } from './constants';

// 呼び出し元が admin であることを検証し、uid を返す。
// users/{uid}.role === 'admin' で判定（Firestore ルールと同じ基準）。
export async function requireAdmin(request: CallableRequest): Promise<string> {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'ログインしてください。');
  }
  const uid = request.auth.uid;
  const snap = await db.collection(COLLECTIONS.USERS).doc(uid).get();
  if (!snap.exists || snap.get('role') !== 'admin') {
    throw new HttpsError('permission-denied', '管理者権限が必要です。');
  }
  return uid;
}
