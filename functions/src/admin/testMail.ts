import { onRequest } from 'firebase-functions/v2/https';
import { REGION } from '../lib/admin';
import {
  createTransporter,
  MAIL_FROM_DISPLAY,
  ZOHO_USER,
  ZOHO_APP_PASSWORD,
} from '../lib/mailer';

export const testMail = onRequest(
  { region: REGION, secrets: [ZOHO_USER, ZOHO_APP_PASSWORD], cors: true },
  async (req, res) => {
    const to = String(req.query.to ?? '');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      res.status(400).send('?to=メールアドレス をつけて開いてください');
      return;
    }
    try {
      const transporter = createTransporter();
      const info = await transporter.sendMail({
        from: MAIL_FROM_DISPLAY,
        to,
        subject: 'テストメール',
        text: 'Zoho SMTP 経由のテストです。',
      });
      res.send('送信成功: ' + info.response);
    } catch (e) {
      res.status(500).send('送信失敗: ' + (e instanceof Error ? e.message : String(e)));
    }
  }
);
