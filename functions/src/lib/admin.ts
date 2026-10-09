import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';

if (getApps().length === 0) {
  initializeApp();
}

export const db = getFirestore();
export const FV = FieldValue;
export const TS = Timestamp;

// リージョン共通
export const REGION = 'asia-northeast1';

// ============================================================
// 無料期間（登録から3ヶ月）
// ============================================================
export const FREE_TRIAL_MONTHS = 3;

export function computeFreeUntil(from: Date): Date {
  const d = new Date(from);
  d.setMonth(d.getMonth() + FREE_TRIAL_MONTHS);
  return d;
}

export function isInFreeTrial(freeUntil: unknown): boolean {
  if (!freeUntil) return false;
  // Firestore Timestamp
  if (typeof freeUntil === 'object' && freeUntil !== null && 'toDate' in freeUntil) {
    return (freeUntil as { toDate: () => Date }).toDate() > new Date();
  }
  if (freeUntil instanceof Date) return freeUntil > new Date();
  return false;
}
