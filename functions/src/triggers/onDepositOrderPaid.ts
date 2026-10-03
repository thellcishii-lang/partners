import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { db, REGION } from '../lib/admin';
import { COLLECTIONS } from '../lib/constants';
import { grantDeposit, releasePending } from '../deposit';
import { enqueueMail } from '../lib/mail';

export const onDepositOrderPaid = onDocumentUpdated(
  {
    document: `${COLLECTIONS.DEPOSIT_ORDERS}/{orderId}`,
    region: REGION,
  },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;

    // pending → paid の遷移だけ処理
    if (before.status === 'paid' || after.status !== 'paid') return;

    const { advertiserId, credits, orderId } = { ...after, orderId: event.params.orderId };

    // 1) 残高加算
    await grantDeposit({
      advertiserId,
      amount: credits,
      reason: 'stripe',
      orderId,
    });

    // 2) 保留を古い順に自動開示
    const { released, remainingPending } = await releasePending(advertiserId);

    // 3) 購入完了メール
    const advSnap = await db.collection(COLLECTIONS.ADVERTISERS).doc(advertiserId).get();
    const adv = advSnap.data()!;
    await enqueueMail('DEPOSIT_PURCHASED', adv.email, {
      advertiserId,
      orderId,
      credits,
      releasedCount: released.length,
      remainingPending,
    });
  }
);
