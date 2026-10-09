import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions';
import { db, REGION } from '../lib/admin';
import { COLLECTIONS } from '../lib/constants';

const FREE_TRIAL_MONTHS = 3;

function computeFreeUntil(from: Date): Date {
  const d = new Date(from);
  d.setMonth(d.getMonth() + FREE_TRIAL_MONTHS);
  return d;
}

/**
 * advertisers/{uid} が作成されたら freeUntil を自動セット。
 * createdAt + 3ヶ月。
 */
export const onAdvertiserCreated = onDocumentCreated(
  {
    document: `${COLLECTIONS.ADVERTISERS}/{advertiserId}`,
    region: REGION,
    memory: '256MiB',
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const data = snap.data();
    // 既に freeUntil があれば何もしない
    if (data.freeUntil) return;

    const now = new Date();
    const freeUntil = computeFreeUntil(now);

    try {
      await snap.ref.update({
        freeUntil,
        freeTrialStartedAt: now,
        updatedAt: now,
      });
      logger.info('onAdvertiserCreated: freeUntil set', {
        advertiserId: event.params.advertiserId,
        freeUntil: freeUntil.toISOString(),
      });
    } catch (error) {
      logger.error('onAdvertiserCreated failed', {
        advertiserId: event.params.advertiserId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
);
