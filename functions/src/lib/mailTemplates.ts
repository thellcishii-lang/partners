import type { MailTemplate } from './mail';

export interface RenderedMail {
  subject: string;
  text: string;
}

const SITE_URL = 'https://partners-tau-kohl.vercel.app';
const SITE_NAME = '代理店・加盟店募集.com';

export function renderTemplate(
  template: MailTemplate,
  params: Record<string, unknown>
): RenderedMail {
  const p = (k: string) => (params[k] != null ? String(params[k]) : '');
  const n = (k: string) => (typeof params[k] === 'number' ? (params[k] as number) : 0);

  const footer = `\n─────────────────────\n代理店・加盟店募集.com\nhttps://www.代理店・加盟店募集.com\ninfo@agent-partners.space\n`;

  switch (template) {
        case 'INQUIRY_DELIVERED':
      return {
        subject: `【${SITE_NAME}】資料請求がございました`,
        text: `${p('advertiserName')} 様

「${p('listingTitle')}」に資料請求がございました。

─────────────
氏名：${p('applicantName')}
住所：${p('address')}
電話番号：${p('phone')}
メール：${p('email')}
─────────────

応募者の応募動機など詳細は、マイページでご確認いただけます。
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

デポジットが０になりますと掲載されている案件がすべて非公開になります。
非公開になるのを避けるには、あらかじめ余裕をもってデポジット追加する事をお勧めいたします。
${SITE_URL}/deposit
${footer}`,
      };

    case 'DEPOSIT_ZERO':
      return {
        subject: `【${SITE_NAME}】デポジット残高がゼロになりました`,
        text: `デポジット残高がゼロになりました。

現在掲載中の案件が非公開となりました。
公開を再開するにはデポジットが必要になります。
${SITE_URL}/deposit
${footer}`,
      };

    case 'DEPOSIT_PURCHASED':
      return {
        subject: `【${SITE_NAME}】デポジットを購入しました`,
        text: `${n('credits')}件分のデポジットを購入しました。

マイページ：${SITE_URL}/dashboard
デポジット履歴：${SITE_URL}/dashboard/deposits
${footer}`,
      };

        case 'APPLICATION_RECEIVED':
      return {
        subject: `【${SITE_NAME}】資料請求ありがとうございます`,
        text: `${p('applicantName')} 様

この度は、資料請求頂き誠にありがとうございます。
${p('advertiserName')} の「${p('listingTitle')}」の資料をお送りします。

─────────────
案件：${p('listingTitle')}
募集企業：${p('advertiserName')}
─────────────

資料は本メールに添付しています。
ご不明な点がございましたら、本メールにご返信ください。

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

           case 'INQUIRY_REPEAT':
      return {
        subject: `【${SITE_NAME}】2回目の資料請求がございました`,
        text: `${p('advertiserName')} 様

「${p('listingTitle')}」に、2回目の資料請求がございました。

─────────────
氏名：${p('applicantName')}
住所：${p('address')}
電話番号：${p('phone')}
メール：${p('email')}
─────────────

同じ電話番号またはメールアドレスからの再応募のため、
今回はデポジット消費はありません。

マイページ：${SITE_URL}/dashboard
${footer}`,
      };

          case 'FREE_TRIAL_ENDING_2MONTH':
      return {
        subject: `【${SITE_NAME}】無料期間がまもなく終了します`,
        text: `${p('advertiserName')} 様

登録から3ヶ月間の無料期間が、まもなく終了します。
終了後は、デポジットがないと案件を公開できなくなります。

デポジットを追加すると、継続して案件を公開できます。
${SITE_URL}/deposit

無料期間終了日：${p('freeUntil') ? new Date(p('freeUntil')).toLocaleDateString('ja-JP') : '—'}
${footer}`,
      };

    case 'FREE_TRIAL_ENDING_10DAYS':
      return {
        subject: `【${SITE_NAME}】無料期間終了まで、あと10日です`,
        text: `${p('advertiserName')} 様

登録から3ヶ月間の無料期間終了まで、あと10日となりました。
終了後は、デポジットがないと案件を公開できなくなります。

デポジットを追加すると、継続して案件を公開できます。
${SITE_URL}/deposit

無料期間終了日：${p('freeUntil') ? new Date(p('freeUntil')).toLocaleDateString('ja-JP') : '—'}
${footer}`,
      };

    case 'FREE_TRIAL_ENDING_TOMORROW':
      return {
        subject: `【${SITE_NAME}】明日で無料期間が終了します`,
        text: `${p('advertiserName')} 様

明日で、登録から3ヶ月間の無料期間が終了します。
終了後、デポジットがない場合、すべての案件が非公開となります。

引き続き掲載を続けるには、デポジットを追加してください。
${SITE_URL}/deposit

無料期間終了日：${p('freeUntil') ? new Date(p('freeUntil')).toLocaleDateString('ja-JP') : '—'}
${footer}`,
      };

    case 'FREE_TRIAL_ENDED':
      return {
        subject: `【${SITE_NAME}】無料期間が終了し、掲載を停止しました`,
        text: `${p('advertiserName')} 様

登録から3ヶ月間の無料期間が終了したため、
すべての案件を非公開としました。

引き続き掲載を再開するには、デポジットを追加してください。
${SITE_URL}/deposit

デポジットを追加すると、案件を再度公開できます。
${footer}`,
      };




    default:
      return {
        subject: `【${SITE_NAME}】お知らせ`,
        text: `通知があります。\n\n${SITE_URL}\n`,
      };
  }
}
