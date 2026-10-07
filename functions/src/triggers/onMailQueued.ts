import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions';
import { FieldValue } from 'firebase-admin/firestore';
import { REGION } from '../lib/admin';
import {
  createTransporter,
  MAIL_FROM_DISPLAY,
  ZOHO_USER,
  ZOHO_APP_PASSWORD,
} from '../lib/mailer';
import { renderTemplate } from '../lib/mailTemplates';
import type { MailTemplate } from '../lib/mail';

export const onMailQueued = onDocumentCreated(
  {
    document: 'mailLogs/{logId}',
    region: REGION,
    secrets: [ZOHO_USER, ZOHO_APP_PASSWORD],
    memory: '256MiB',
    timeoutSeconds: 60,
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const log = snap.data();
    if (!log || log.status !== 'queued') return;

    const { template, to, params } = log as {
      template: MailTemplate;
      to: string;
      params: Record<string, unknown>;
    };

    const ref = snap.ref;

    try {
      const { subject, text } = renderTemplate(template, params ?? {});
      const transporter = createTransporter();
      await transporter.sendMail({
        from: MAIL_FROM_DISPLAY,
        to,
        subject,
        text,
      });
      await ref.update({
        status: 'sent',
        sentAt: FieldValue.serverTimestamp(),
      });
      logger.info('Mail sent', { logId: event.params.logId, template, to });
    } catch (error) {
      logger.error('Mail send failed', {
        logId: event.params.logId,
        template,
        to,
        error: error instanceof Error ? error.message : String(error),
      });
      await ref.update({
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
        failedAt: FieldValue.serverTimestamp(),
      });
    }
  }
);
