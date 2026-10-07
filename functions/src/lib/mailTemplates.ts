import type { MailTemplate } from './mail';

export interface RenderedMail {
  subject: string;
  text: string;
}

const SITE_URL = 'https://partners-tau-kohl.vercel.app';
const SITE_NAME = '代理店募集・加盟店募集.com';

export function renderTemplate(
  template: MailTemplate,
  params: Record<string, unknown>
): RenderedMail {
  const p = (k: string) => (params[k] != null ? String(params[k]) : '');
  const n = (k: string) => (typeof params[k] === 'number' ? (params[k] as number) : 0);

  const footer = `\n─────────────────────\n${SITE_NAME}\n${SITE_URL}\n`;

  switch (template) {
    case 'INQUIRY_DELIVERED':
      return {
        subject: `【${SITE_NAME}】新しい応募が届きました`,
        text: `新しい応募が届き、内容を開示しました。

マイページにログインしてご確認ください。
${SITE_URL}/dashboard

残りのデポジット：${n('balanceAfter')}件
${footer}`,
      };

    case 'INQUIRY_HELD_NO_DEPOSIT':
      return {
        subject: `【${SITE_NAME}】応募が届きました（デポジット残高不足）`,
        text: `新しい応募が届きましたが、デポジット残高が不足しているため、
内容はまだ開示されていません。

デポジットを追加すると、古い応募から自動的に開示されます。
${SITE_URL}/deposit
${footer}`,
      };

    case 'DEPOSIT_LOW':
      return {
        subject: `【${SITE_NAME}】デポジット残高が少なくなっています`,
        text: `デポジット残高が残り${n('balance')}件になりました。

追加すると、保留中の応募が古い順に自動開示されます。
${SITE_URL}/deposit
${footer}`,
      };

    case 'DEPOSIT_ZERO':
      return {
        subject: `【${SITE_NAME}】デポジット残高がゼロになりました`,
        text: `デポジット残高がゼロになりました。

新しい応募の内容は開示されず、保留状態になります。
追加すると自動的に開示されます。
${SITE_URL}/deposit
${footer}`,
      };

    case 'DEPOSIT_PURCHASED':
      return {
        subject: `【${SITE_NAME}】デポジットを購入しました`,
        text: `${n('credits')}件分のデポジットを購入しました。
${n('releasedCount') > 0 ? `\n保留中だった応募 ${n('releasedCount')}件を自動開示しました。` : ''}${n('remainingPending') > 0 ? `\n未開示の応募が ${n('remainingPending')}件 残っています。` : ''}

マイページ：${SITE_URL}/dashboard
デポジット履歴：${SITE_URL}/dashboard/deposits
${footer}`,
      };

    case 'APPLICATION_RECEIVED':
      return {
        subject: `【${SITE_NAME}】応募を受け付けました`,
        text: `ご応募ありがとうございます。

応募を受け付けました。
募集者が内容を確認すると、開示処理が行われます。

応募履歴：${SITE_URL}/applicant
${footer}`,
      };

    case 'LISTING_APPROVED':
      return {
        subject: `【${SITE_NAME}】案件が承認されました`,
        text: `ご申請いただいた案件が承認され、サイトに公開されました。

マイページ：${SITE_URL}/dashboard
${footer}`,
      };

    case 'LISTING_REJECTED':
      return {
        subject: `【${SITE_NAME}】案件の審査結果`,
        text: `ご申請いただいた案件は、以下の理由により却下となりました。
下書きに戻しています。内容をご確認のうえ、再度ご申請ください。

${p('reason') ? `理由：${p('reason')}\n` : ''}
マイページ：${SITE_URL}/dashboard
${footer}`,
      };

    case 'LISTING_EDIT_APPROVED':
      return {
        subject: `【${SITE_NAME}】編集内容が承認されました`,
        text: `公開中の案件の編集内容が承認され、サイトに反映されました。

マイページ：${SITE_URL}/dashboard
${footer}`,
      };

    case 'LISTING_EDIT_REJECTED':
      return {
        subject: `【${SITE_NAME}】編集内容の審査結果`,
        text: `公開中の案件の編集内容は、以下の理由により却下となりました。
公開中の内容は変更されていません。

${p('reason') ? `理由：${p('reason')}\n` : ''}
マイページ：${SITE_URL}/dashboard
${footer}`,
      };

    case 'WELCOME_ADVERTISER':
      return {
        subject: `【${SITE_NAME}】ご登録ありがとうございます`,
        text: `ご登録ありがとうございます。

3ヶ月間、掲載料は無料です。
さっそく最初の案件を登録しましょう。
${SITE_URL}/listings/new
${footer}`,
      };

    case 'FREE_TRIAL_ENDING':
      return {
        subject: `【${SITE_NAME}】無料期間がまもなく終了します`,
        text: `無料トライアル期間がまもなく終了します。
継続をご希望の場合は、デポジットをご購入ください。

${SITE_URL}/deposit
${footer}`,
      };

    case 'PENDING_RELEASED':
      return {
        subject: `【${SITE_NAME}】保留中の応募を開示しました`,
        text: `保留中だった応募が開示されました。

マイページ：${SITE_URL}/dashboard
${footer}`,
      };

    case 'APPLICATION_EXPIRED':
      return {
        subject: `【${SITE_NAME}】応募の有効期限が切れました`,
        text: `一定期間内に開示されなかったため、応募は期限切れとなりました。
${footer}`,
      };

    default:
      return {
        subject: `【${SITE_NAME}】お知らせ`,
        text: `通知があります。\n\n${SITE_URL}\n`,
      };
  }
}
