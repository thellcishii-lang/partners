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
