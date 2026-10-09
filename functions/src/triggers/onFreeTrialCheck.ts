import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions';
import { FieldValue } from 'firebase-admin/firestore';
import { db, REGION } from '../lib/admin';
import { COLLECTIONS } from '../lib/constants';
import { enqueueMail } from '../lib/mail';

const DAY_MS = 24 * 60 * 60 * 1000;

function daysBetween(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / DAY_MS);
}

function yyyymm(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export const onFreeTrialCheck = onSchedule(
  {
    schedule: 'every day 03:00',
    timeZone: 'Asia/Tokyo',
    region: REGION,
    memory: '512MiB',
    timeoutSeconds: 300,
  },
  async () => {
    const now = new Date();
    const advertisersSnap = await db.collection(COLLECTIONS.ADVERTISERS).get();

    logger.info('onFreeTrialCheck start', { advertiserCount: advertisersSnap.size });

    for (const advDoc of advertisersSnap.docs) {
      const adv = advDoc.data();
      const advertiserId = advDoc.id;

      // freeUntil がない場合はスキップ（過去データ）
      const freeUntilRaw = adv.freeUntil;
      if (!freeUntilRaw || typeof freeUntilRaw !== 'object' || !('toDate' in freeUntilRaw)) {
        continue;
      }
      const freeUntil = (freeUntilRaw as { toDate: () => Date }).toDate();
      const daysLeft = daysBetween(freeUntil, now);
      const balance = (adv.depositBalance ?? 0) as number;

      try {
        // ─── 3ヶ月経過（daysLeft <= 0） ───
        if (daysLeft <= 0) {
          // 残高があれば何もしない
          if (balance > 0) continue;

          // 全案件を paused に
          const listingsSnap = await db
            .collection(COLLECTIONS.LISTINGS)
            .where('advertiserId', '==', advertiserId)
            .where('status', 'in', ['published', 'reviewing'])
            .get();

          if (!listingsSnap.empty) {
            const batch = db.batch();
            listingsSnap.docs.forEach((d) => {
              batch.update(d.ref, {
                status: 'paused',
                updatedAt: FieldValue.serverTimestamp(),
              });
            });
            await batch.commit();

            logger.info('onFreeTrialCheck: paused listings', {
              advertiserId,
              count: listingsSnap.size,
            });
          }

          // 「掲載停止しました」メール
          if (typeof adv.email === 'string' && adv.email) {
            await enqueueMail('FREE_TRIAL_ENDED', adv.email, {
              advertiserId,
            });
          }

          // 停止日を記録（重複送信防止 + 後で参照）
          await advDoc.ref.update({
            pausedAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          });
          continue;
        }

        // ─── 前日（daysLeft === 1） ───
        if (daysLeft === 1 && balance === 0) {
          if (typeof adv.email === 'string' && adv.email) {
            await enqueueMail('FREE_TRIAL_ENDING_TOMORROW', adv.email, {
              advertiserId,
              freeUntil: freeUntil.toISOString(),
            });
          }
          continue;
        }

        // ─── 10日前（daysLeft === 10） ───
        if (daysLeft === 10 && balance === 0) {
          if (typeof adv.email === 'string' && adv.email) {
            await enqueueMail('FREE_TRIAL_ENDING_10DAYS', adv.email, {
              advertiserId,
              freeUntil: freeUntil.toISOString(),
            });
          }
          continue;
        }

        // ─── 2ヶ月経過 ───
        // 登録から2ヶ月（= freeUntil の1ヶ月前）を過ぎたら
        // daysLeft <= 30 になった最初の日
        if (daysLeft <= 30 && daysLeft > 11 && balance === 0) {
          const key = yyyymm(now);
          if (typeof adv.email === 'string' && adv.email) {
            await enqueueMail('FREE_TRIAL_ENDING_2MONTH', adv.email, {
              advertiserId,
              freeUntil: freeUntil.toISOString(),
            });
          }
          void key;
        }
      } catch (error) {
        logger.error('onFreeTrialCheck: failed for advertiser', {
          advertiserId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    logger.info('onFreeTrialCheck done');
  }
);
