import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { REGION } from '../lib/admin';
import { requireAdmin } from '../lib/roles';
import { enqueueMail, type MailTemplate } from '../lib/mail';

const ALLOWED_TEMPLATES: MailTemplate[] = [
  'WELCOME_ADVERTISER',
  'INQUIRY_DELIVERED',
  'INQUIRY_HELD_NO_DEPOSIT',
  'INQUIRY_REPEAT',
  'DEPOSIT_LOW',
  'DEPOSIT_ZERO',
  'DEPOSIT_PURCHASED',
  'PENDING_RELEASED',
  'FREE_TRIAL_ENDING',
  'FREE_TRIAL_ENDING_2MONTH',
  'FREE_TRIAL_ENDING_10DAYS',
  'FREE_TRIAL_ENDING_TOMORROW',
  'FREE_TRIAL_ENDED',
  'APPLICATION_RECEIVED',
  'APPLICATION_EXPIRED',
  'LISTING_APPROVED',
  'LISTING_REJECTED',
  'LISTING_EDIT_APPROVED',
  'LISTING_EDIT_REJECTED',
  'APPLICANT_RESOURCES',
];

function text(data: Record<string, unknown>, key: string, max: number, required = false): string {
  const value = data[key];
  if (typeof value !== 'string' || value.trim().length > max || (required && !value.trim())) {
    throw new HttpsError('invalid-argument', `${key}の入力を確認してください。`);
  }
  return value.trim();
}

export const sendTestMail = onCall({ region: REGION }, async (request) => {
  await requireAdmin(request);
  const data = (request.data ?? {}) as Record<string, unknown>;

  const template = text(data, 'template', 50, true) as MailTemplate;
  if (!ALLOWED_TEMPLATES.includes(template)) {
    throw new HttpsError('invalid-argument', 'テンプレート名が正しくありません。');
  }
  const to = text(data, 'to', 254, true);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    throw new HttpsError('invalid-argument', 'メールアドレスの形式が正しくありません。');
  }

  const rawParams = data.params;
  const params: Record<string, unknown> =
    rawParams && typeof rawParams === 'object' && !Array.isArray(rawParams)
      ? (rawParams as Record<string, unknown>)
      : {};

  // テスト送信は毎回固有のキーにして、冪等性で弾かれないようにする
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  await enqueueMail(template, to, {
    ...params,
    // inquiryId をテスト用のユニーク値に差し替え（冪等キーに使われる）
    inquiryId: `test-${nonce}`,
  });

  return { ok: true, template, to };
});
