import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions';
import { db, REGION } from '../lib/admin';
import { COLLECTIONS } from '../lib/constants';
import { enqueueMail } from '../lib/mail';

export const onPromotionOrderPaid = onDocumentUpdated(
  {
    document: 'listingPromotions/{promotionId}',
    region: REGION,
  },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;

    // pending → active の遷移のみ
    if (before.status === 'active' || after.status !== 'active') return;

    const promotionId = event.params.promotionId;
    const advertiserId = after.advertiserId as string;
    const listingId = after.listingId as string;
    const plan = after.plan as 'top' | 'recommend';
    const startAt = after.startAt?.toDate?.() as Date | undefined;
    const endAt = after.endAt?.toDate?.() as Date | undefined;

    if (!advertiserId || !listingId || !plan || !startAt) {
      logger.error('onPromotionOrderPaid: missing data', { promotionId });
      return;
    }

    // 案件にフラグを立てる
    const listingRef = db.collection(COLLECTIONS.LISTINGS).doc(listingId);
    const update: Record<string, unknown> = {
      updatedAt: new Date(),
    };
        const targetIndustry = (after.targetIndustry as string) || 'all'; // ★追加

    if (plan === 'top') {
      update.promotedTopTargets = [targetIndustry]; // ★配列で保存
      update.promotedTopUntil = endAt ?? null;
    } else {
      update.promotedRecommendTargets = [targetIndustry]; // ★配列で保存
      update.promotedRecommendUntil = endAt ?? null;
    }
    await listingRef.update(update);

    // 完了メール
    const advSnap = await db.collection(COLLECTIONS.ADVERTISERS).doc(advertiserId).get();
    const email = advSnap.get('email');
    const listingSnap = await listingRef.get();
    const listingTitle = (listingSnap.get('title') ?? '') as string;

    if (typeof email === 'string' && email) {
      await enqueueMail('PROMOTION_PURCHASED', email, {
        advertiserId,
        promotionId,
        listingId,
        listingTitle,
        plan,
        planLabel: plan === 'top' ? '上部表示' : 'おすすめ表示',
        startAt: startAt.toISOString(),
        endAt: endAt?.toISOString() ?? '',
      });
    }

    logger.info('onPromotionOrderPaid done', { promotionId, listingId, plan });
  }
);
