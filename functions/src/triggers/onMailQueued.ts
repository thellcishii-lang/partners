import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { REGION } from '../lib/admin';
import {
  createTransporter,
  MAIL_FROM_DISPLAY,
  ZOHO_USER,
  ZOHO_APP_PASSWORD,
  type MailAttachment,
} from '../lib/mailer';
import { renderTemplate } from '../lib/mailTemplates';
import type { MailTemplate } from '../lib/mail';

interface AttachmentSpec {
  path: string;
  name: string;
  type: string;
}

async function loadAttachments(
  specs: AttachmentSpec[],
): Promise<MailAttachment[]> {
  if (!specs || specs.length === 0) return [];
  const bucket = getStorage().bucket();
  const results: MailAttachment[] = [];
  for (const spec of specs) {
    try {
      const file = bucket.file(spec.path);
      const [buffer] = await file.download();
      results.push({
        filename: spec.name,
        content: buffer,
        contentType: spec.type,
      });
    } catch (error) {
      logger.error('Failed to load attachment', {
        path: spec.path,
        error: error instanceof Error ? error.message : String(error),
      });
      // 1つ失敗しても、他の添付で送信を続行
    }
  }
  return results;
}

export const onMailQueued = onDocumentCreated(
  {
    document: 'mailLogs/{logId}',
    region: REGION,
    secrets: [ZOHO_USER, ZOHO_APP_PASSWORD],
    memory: '512MiB',
    timeoutSeconds: 120,
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const log = snap.data();
    if (!log || log.status !== 'queued') return;

    const { template, to, params } = log as {
      template: MailTemplate;
      to: string;
      params: Record<string, unknown> & { attachments?: AttachmentSpec[] };
    };

    const ref = snap.ref;

    try {
      const { subject, text } = renderTemplate(template, params ?? {});

      // 添付ファイルの取得
      const attachments = await loadAttachments(params?.attachments ?? []);

      const transporter = createTransporter();
      await transporter.sendMail({
        from: MAIL_FROM_DISPLAY,
        to,
        subject,
        text,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      await ref.update({
        status: 'sent',
        sentAt: FieldValue.serverTimestamp(),
        attachmentCount: attachments.length,
      });
      logger.info('Mail sent', {
        logId: event.params.logId,
        template,
        to,
        attachmentCount: attachments.length,
      });
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

// getFirestore は将来使う可能性があるので残す
void getFirestore;
