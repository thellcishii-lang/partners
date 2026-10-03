import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { db, REGION } from '../lib/admin';
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
    const { advertiserId, applicantId, maskedPreview } = inq;

    // ▼ 消費トランザクション
    const result = await consumeOne(advertiserId, inquiryId, {
      reason: `inquiry:${inquiryId}`,
    });

    // ▼ 募集者へ
    const advSnap = await db.collection(COLLECTIONS.ADVERTISERS).doc(advertiserId).get();
    const adv = advSnap.data()!;

    if (result.delivered) {
      await enqueueMail('INQUIRY_DELIVERED', adv.email, {
        inquiryId,
        advertiserId,
        balanceAfter: result.balanceAfter,
      });
      if (result.notifyLow) {
        await enqueueMail('DEPOSIT_LOW', adv.email, {
          advertiserId,
          balance: result.balanceAfter,
        });
      }
    } else {
      // 残高0 or 既処理 → 保留 or 何もしない
      if (result.reason === 'no_balance') {
        await enqueueMail('INQUIRY_HELD_NO_DEPOSIT', adv.email, {
          inquiryId,
          advertiserId,
          masked: maskedPreview,
        });
        // 残高0到達通知（初回のみ）
        if (adv.lowDepositNotified !== 0) {
          await db.collection(COLLECTIONS.ADVERTISERS).doc(advertiserId).update({
            lowDepositNotified: 0,
          });
          await enqueueMail('DEPOSIT_ZERO', adv.email, { advertiserId });
        }
      }
    }

    // ▼ 応募者へ（受付完了）
    const appSnap = await db.collection(COLLECTIONS.APPLICANTS).doc(applicantId).get();
    const appEmail = appSnap.data()?.email;
    if (appEmail) {
      await enqueueMail('APPLICATION_RECEIVED', appEmail, { inquiryId });
    }
  }
);
