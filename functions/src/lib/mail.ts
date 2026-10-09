import { db, TS } from './admin';
import { COLLECTIONS } from './constants';

export type MailTemplate =
  | 'WELCOME_ADVERTISER'
  | 'INQUIRY_DELIVERED'
  | 'INQUIRY_HELD_NO_DEPOSIT'
  | 'DEPOSIT_LOW'
  | 'DEPOSIT_ZERO'
  | 'DEPOSIT_PURCHASED'
  | 'PENDING_RELEASED'
  | 'FREE_TRIAL_ENDING'
  | 'APPLICATION_RECEIVED'
  | 'APPLICATION_EXPIRED'
  | 'LISTING_APPROVED'
  | 'LISTING_REJECTED'
  | 'LISTING_EDIT_APPROVED'
  | 'LISTING_EDIT_REJECTED'
  | 'APPLICANT_RESOURCES';   // ★ 追加

export async function enqueueMail(
  template: MailTemplate,
  to: string,
  params: Record<string, unknown> & {
    inquiryId?: string;
    orderId?: string;
    advertiserId?: string;
    listingId?: string;
  }
): Promise<void> {
  const idempotencyKey = [
    template,
    params.inquiryId ?? '',
    params.orderId ?? '',
    params.advertiserId ?? '',
    params.listingId ?? '',
  ].join('|');

  // Firestore の doc ID にスラッシュは使えないため置換
  const docId = idempotencyKey.replace(/\//g, '_');
  const ref = db.collection(COLLECTIONS.MAIL_LOGS).doc(docId);

  try {
    await ref.create({
      template,
      to,
      params,
      idempotencyKey,
      status: 'queued',
      error: null,
      createdAt: TS.now(),
    });
  } catch (e) {
    const code = (e as { code?: number | string })?.code;
    if (code === 6 || code === 'already-exists' || code === 'ALREADY_EXISTS') {
      return;
    }
    throw e;
  }
}
