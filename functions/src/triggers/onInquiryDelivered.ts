import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions';
import { db, REGION } from '../lib/admin';
import { COLLECTIONS } from '../lib/constants';
import { enqueueMail } from '../lib/mail';

interface AttachmentSpec {
  path: string;
  name: string;
  type: string;
}

/**
 * inquiries/{id} の status が pending → delivered に変わった時、
 * 応募者の登録メールに、案件の資料を添付して送信する。
 *
 * 資料が無い案件の場合は何もしない。
 */
export const onInquiryDelivered = onDocumentUpdated(
  {
    document: `${COLLECTIONS.INQUIRIES}/{inquiryId}`,
    region: REGION,
    memory: '256MiB',
    timeoutSeconds: 60,
  },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;

    // pending → delivered のみ対象
    if (before.status !== 'pending' || after.status !== 'delivered') return;

    const inquiryId = event.params.inquiryId;
    const listingId: unknown = after.listingId;
    const advertiserId: unknown = after.advertiserId;

    if (typeof listingId !== 'string' || !listingId || listingId.includes('/')) {
      logger.warn('onInquiryDelivered: invalid listingId', { inquiryId, listingId });
      return;
    }

    try {
      // 案件と応募詳細を並列取得
      const [listingSnap, detailSnap] = await Promise.all([
        db.collection(COLLECTIONS.LISTINGS).doc(listingId).get(),
        db.collection(COLLECTIONS.INQUIRY_DETAILS).doc(inquiryId).get(),
      ]);

      if (!listingSnap.exists) {
        logger.warn('onInquiryDelivered: listing not found', { inquiryId, listingId });
        return;
      }
      if (!detailSnap.exists) {
        logger.warn('onInquiryDelivered: inquiryDetails not found', { inquiryId });
        return;
      }

      const listing = listingSnap.data()!;
      const detail = detailSnap.data()!;

      // 資料が無ければ何もしない
      const documents = (listing.documents ?? []) as Array<{
        url?: string;
        path?: string;
        name?: string;
        type?: string;
      }>;
      const attachments: AttachmentSpec[] = documents
        .filter((d) => typeof d.path === 'string' && typeof d.name === 'string' && typeof d.type === 'string')
        .map((d) => ({
          path: d.path as string,
          name: d.name as string,
          type: d.type as string,
        }));

      // 募集者の会社名
      let advertiserName = '';
      if (typeof advertiserId === 'string' && advertiserId && !advertiserId.includes('/')) {
        const advSnap = await db.collection(COLLECTIONS.ADVERTISERS).doc(advertiserId).get();
        advertiserName = (advSnap.data()?.companyName ?? '') as string;
      }

      // 応募者のメールアドレス
      const applicantEmail = detail.email as unknown;
      if (typeof applicantEmail !== 'string' || !applicantEmail) {
        logger.warn('onInquiryDelivered: no applicant email', { inquiryId });
        return;
      }

      const applicantName = (detail.fullName ?? detail.kana ?? '') as string;
      const listingTitle = (listing.title ?? '') as string;

      await enqueueMail('APPLICANT_RESOURCES', applicantEmail, {
        inquiryId,
        listingId,
        advertiserId: typeof advertiserId === 'string' ? advertiserId : undefined,
        applicantName,
        listingTitle,
        advertiserName,
        attachments,
      } as Record<string, unknown> & {
        inquiryId: string;
        listingId: string;
        advertiserId?: string;
      });

      logger.info('onInquiryDelivered: queued mail with attachments', {
        inquiryId,
        attachmentCount: attachments.length,
      });
    } catch (error) {
      logger.error('onInquiryDelivered failed', {
        inquiryId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
);
