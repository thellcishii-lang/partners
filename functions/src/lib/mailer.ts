import nodemailer from 'nodemailer';
import { defineSecret } from 'firebase-functions/params';

// 本番：firebase functions:secrets:set ZOHO_USER / ZOHO_APP_PASSWORD
// エミュレータ：functions/.secret.local に記載（gitignore 対象）
export const ZOHO_USER = defineSecret('ZOHO_USER');
export const ZOHO_APP_PASSWORD = defineSecret('ZOHO_APP_PASSWORD');

// 送信元表示（受信者に見えるアドレス）
export const MAIL_FROM_ADDRESS = 'info@agent-partners.space';
export const MAIL_FROM_DISPLAY = `代理店募集・加盟店募集.com <${MAIL_FROM_ADDRESS}>`;

export function createTransporter() {
  return nodemailer.createTransport({
    host: 'smtppro.zoho.jp',   // smtp.zoho.jp → smtppro.zoho.jp
    port: 465,
    secure: true,
    auth: {
      user: ZOHO_USER.value(),
      pass: ZOHO_APP_PASSWORD.value(),
    },
  });
}
// ============================================================
// 添付ファイル
// ============================================================
export interface MailAttachment {
  /** ファイル名（受信者に見える名前） */
  filename: string;
  /** ファイルの中身（Buffer） */
  content: Buffer;
  /** MIMEタイプ */
  contentType: string;
}
