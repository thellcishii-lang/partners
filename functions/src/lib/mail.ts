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
  | 'LISTING_REJECTED';

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

  const existing = await db.collection(COLLECTIONS.MAIL_LOGS)
    .where('idempotencyKey', '==', idempotencyKey)
    .limit(1)
    .get();
  if (!existing.empty) return;

  await db.collection(COLLECTIONS.MAIL_LOGS).add({
    template,
    to,
    params,
    idempotencyKey,
    status: 'queued',
    error: null,
    createdAt: TS.now(),
  });
}
