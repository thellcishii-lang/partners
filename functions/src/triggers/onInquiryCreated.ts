import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions';
import { db, FV, REGION } from '../lib/admin';
import { COLLECTIONS } from '../lib/constants';
import { consumeOne } from '../deposit';
import { enqueueMail } from '../lib/mail';

export const onInquiryCreated = onDocumentCreated(
  {
    document: `${COLLECTIONS.INQUIRIES}/{inquiryId}`,
    region: REGION,
    memory: '256MiB',
    timeoutSeconds: 60,
  },
  async (event) => {
    const inquiryId = event.params.inquiryId;
    const snap = event.data;
    if (!snap) return;

    const inq = snap.data();
    const { advertiserId, applicantId, maskedPreview, isRepeat } = inq;

    // ─── 2回目の応募（重複）の場合 ───
    // デポジット消費なし、資料送信は onInquiryDelivered 側で処理
    if (isRepeat === true) {
      try {
        await db.runTransaction(async (tx) => {
          const inqRef = db.collection(COLLECTIONS.INQUIRIES).doc(inquiryId);
          const advRef = db.collection(COLLECTIONS.ADVERTISERS).doc(advertiserId);

          const [inqSnap, advSnap] = await Promise.all([tx.get(inqRef), tx.get(advRef)]);
          if (!inqSnap.exists || !advSnap.exists) return;

          const status = inqSnap.get('status');
          if (status !== 'pending') return;

          const now = FV.serverTimestamp();

          tx.update(inqRef, {
            status: 'delivered',
            deliveredAt: now,
            depositTransactionId: null,
            freeTrial: false,
            isRepeat: true,
            updatedAt: now,
          });

          tx.update(advRef, {
            pendingCount: FV.increment(-1),
            updatedAt: now,
          });
        });

        // 募集者に「2回目の応募」メール
        const advSnap = await db.collection(COLLECTIONS.ADVERTISERS).doc(advertiserId).get();
        const advEmail = advSnap.data()?.email;
        const listingSnap = await db.collection(COLLECTIONS.LISTINGS).doc(inq.listingId).get();
        const listingTitle = listingSnap.data()?.title ?? '';
        const advName = advSnap.data()?.companyName ?? '';

        if (typeof advEmail === 'string' && advEmail) {
          await enqueueMail('INQUIRY_REPEAT', advEmail, {
            inquiryId,
            advertiserId,
            listingTitle,
            advertiserName: advName,
          });
        }

        // 応募者に受付完了メール
        const detailSnap = await db.collection(COLLECTIONS.INQUIRY_DETAILS).doc(inquiryId).get();
        const applicantEmail = detailSnap.data()?.email;
        if (typeof applicantEmail === 'string' && applicantEmail) {
          await enqueueMail('APPLICATION_RECEIVED', applicantEmail, { inquiryId });
        }

        logger.info('onInquiryCreated: repeat inquiry delivered without consuming', {
          inquiryId,
          advertiserId,
        });
        return;
      } catch (error) {
        logger.error('onInquiryCreated: repeat handling failed', {
          inquiryId,
          error: error instanceof Error ? error.message : String(error),
        });
        return;
      }
    }

    // ─── 通常の応募（1回目） ───
    const result = await consumeOne(advertiserId, inquiryId, {
      reason: `inquiry:${inquiryId}`,
    });

    const advSnap = await db.collection(COLLECTIONS.ADVERTISERS).doc(advertiserId).get();
    const adv = advSnap.data()!;

    if (result.delivered) {
      await enqueueMail('INQUIRY_DELIVERED', adv.email, {
        inquiryId,
        advertiserId,
        balanceAfter: result.balanceAfter,
        freeTrial: result.freeTrial,
      });
      if (result.notifyLow) {
        await enqueueMail('DEPOSIT_LOW', adv.email, {
          advertiserId,
          balance: result.balanceAfter,
        });
      }
    } else {
      if (result.reason === 'no_balance') {
        await enqueueMail('INQUIRY_HELD_NO_DEPOSIT', adv.email, {
          inquiryId,
          advertiserId,
          masked: maskedPreview,
        });
        if (adv.lowDepositNotified !== 0) {
          await db.collection(COLLECTIONS.ADVERTISERS).doc(advertiserId).update({
            lowDepositNotified: 0,
          });
          await enqueueMail('DEPOSIT_ZERO', adv.email, { advertiserId });
        }
      }
    }

    const appSnap = await db.collection(COLLECTIONS.APPLICANTS).doc(applicantId).get();
    const appEmail = appSnap.data()?.email;
    if (appEmail) {
      await enqueueMail('APPLICATION_RECEIVED', appEmail, { inquiryId });
    }
  }
);
