import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions';
import { db, REGION } from '../lib/admin';
import { COLLECTIONS } from '../lib/constants';
import { enqueueMail } from '../lib/mail';

const DAY_MS = 24 * 60 * 60 * 1000;

export const onPromotionCheck = onSchedule(
  {
    schedule: 'every day 03:30',
    timeZone: 'Asia/Tokyo',
    region: REGION,
    memory: '512MiB',
    timeoutSeconds: 300,
  },
  async () => {
    const now = new Date();
    logger.info('onPromotionCheck start');

    // ─── ① 期限切れの処理 ───
    // endAt < now かつ status === 'active' の 30日プランを探す
    const expiredSnap = await db
      .collection('listingPromotions')
      .where('status', '==', 'active')
      .where('billingType', '==', 'one_time')
      .where('endAt', '<', now)
      .get();

    logger.info('onPromotionCheck: expired found', { count: expiredSnap.size });

    for (const docSnap of expiredSnap.docs) {
      const data = docSnap.data();
      const advertiserId = data.advertiserId as string;
      const listingId = data.listingId as string;
      const plan = data.plan as 'top' | 'recommend';

      try {
        // promotion を expired に
        await docSnap.ref.update({
          status: 'expired',
          updatedAt: now,
        });

        // 案件のフラグを落とす
        const listingRef = db.collection(COLLECTIONS.LISTINGS).doc(listingId);
        const update: Record<string, unknown> = { updatedAt: now };
        if (plan === 'top') {
          update.isPromotedTop = false;
          update.promotedTopUntil = null;
        } else {
          update.isPromotedRecommend = false;
          update.promotedRecommendUntil = null;
        }
        await listingRef.update(update);

        // 完了メール
        const advSnap = await db.collection(COLLECTIONS.ADVERTISERS).doc(advertiserId).get();
        const email = advSnap.get('email');
        const listingSnap = await listingRef.get();
        const listingTitle = (listingSnap.get('title') ?? '') as string;

        if (typeof email === 'string' && email) {
          await enqueueMail('PROMOTION_EXPIRED', email, {
            advertiserId,
            promotionId: docSnap.id,
            listingId,
            listingTitle,
            plan,
            planLabel: plan === 'top' ? '上部表示' : 'おすすめ表示',
          });
        }

        logger.info('onPromotionCheck: expired processed', {
          promotionId: docSnap.id,
          listingId,
          plan,
        });
      } catch (error) {
        logger.error('onPromotionCheck: expired processing failed', {
          promotionId: docSnap.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // ─── ② 終了3日前の通知（30日プラン） ───
    const threeDaysLater = new Date(now.getTime() + 3 * DAY_MS);
    const tomorrow = new Date(now.getTime() + DAY_MS);

    const endingSnap = await db
      .collection('listingPromotions')
      .where('status', '==', 'active')
      .where('billingType', '==', 'one_time')
      .where('endAt', '>=', tomorrow)
      .where('endAt', '<', threeDaysLater)
      .get();

    logger.info('onPromotionCheck: ending soon found', { count: endingSnap.size });

    for (const docSnap of endingSnap.docs) {
      const data = docSnap.data();
      if (data.endingNotifiedAt) continue;

      const advertiserId = data.advertiserId as string;
      const listingId = data.listingId as string;
      const plan = data.plan as 'top' | 'recommend';
      const endAt = data.endAt?.toDate?.() as Date | undefined;

      try {
        const advSnap = await db.collection(COLLECTIONS.ADVERTISERS).doc(advertiserId).get();
        const email = advSnap.get('email');
        const listingSnap = await db.collection(COLLECTIONS.LISTINGS).doc(listingId).get();
        const listingTitle = (listingSnap.get('title') ?? '') as string;

        if (typeof email === 'string' && email) {
          await enqueueMail('PROMOTION_ENDING', email, {
            advertiserId,
            promotionId: docSnap.id,
            listingId,
            listingTitle,
            plan,
            planLabel: plan === 'top' ? '上部表示' : 'おすすめ表示',
            endAt: endAt?.toISOString() ?? '',
          });
        }

        await docSnap.ref.update({
          endingNotifiedAt: now,
          updatedAt: now,
        });
      } catch (error) {
        logger.error('onPromotionCheck: ending notification failed', {
          promotionId: docSnap.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    logger.info('onPromotionCheck done');
  }
);
