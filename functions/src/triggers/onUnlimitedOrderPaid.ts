import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions';
import { db, REGION } from '../lib/admin';
import { COLLECTIONS } from '../lib/constants';
import { enqueueMail } from '../lib/mail';

export const onUnlimitedOrderPaid = onDocumentUpdated(
  {
    document: 'unlimitedOrders/{orderId}',
    region: REGION,
  },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;

    if (before.status === 'paid' || after.status !== 'paid') return;

    const advertiserId = after.advertiserId as string;
    const endAt = after.endAt?.toDate?.() as Date | undefined;
    const orderId = event.params.orderId;

    if (!advertiserId || !endAt) {
      logger.error('onUnlimitedOrderPaid: missing data', { orderId });
      return;
    }

    // advertisers.unlimitedUntil を更新（既存より後なら上書き）
    const advRef = db.collection(COLLECTIONS.ADVERTISERS).doc(advertiserId);
    const advSnap = await advRef.get();
    if (!advSnap.exists) return;

    const current = advSnap.get('unlimitedUntil') as { toDate?: () => Date } | null | undefined;
    const currentDate = current?.toDate?.() ?? null;

    if (!currentDate || endAt > currentDate) {
      await advRef.update({
        unlimitedUntil: endAt,
        updatedAt: new Date(),
      });
    }

    // 購入完了メール
    const email = advSnap.get('email');
    if (typeof email === 'string' && email) {
      await enqueueMail('UNLIMITED_PURCHASED', email, {
        advertiserId,
        orderId,
        startAt: after.startAt?.toDate?.()?.toISOString() ?? '',
        endAt: endAt.toISOString(),
      });
    }

    logger.info('onUnlimitedOrderPaid done', { orderId, advertiserId });
  }
);
