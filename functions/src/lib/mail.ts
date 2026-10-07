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
  | 'LISTING_EDIT_REJECTED';

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
    // create は既存ドキュメントがあると ALREADY_EXISTS で失敗する。
    // 事前クエリ不要で、同時実行でも片方だけが成功する（冪等）。
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
    // 既に同じ idempotencyKey のログが存在 → 何もしない
    const code = (e as { code?: number | string })?.code;
    if (code === 6 || code === 'already-exists' || code === 'ALREADY_EXISTS') {
      return;
    }
    throw e;
  }
}
