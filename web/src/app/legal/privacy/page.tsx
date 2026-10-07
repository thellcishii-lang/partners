import type { Metadata } from 'next';
import { COMPANY_INFO, SITE_NAME } from '@/lib/companyInfo';

export const metadata: Metadata = {
  title: `プライバシーポリシー | ${SITE_NAME}`,
};

export default function PrivacyPage() {
  const today = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">プライバシーポリシー</h1>
      <p className="mb-6 text-sm text-gray-600">
        最終更新日：{today}
      </p>

      <p className="mb-6 text-sm leading-relaxed">
        {COMPANY_INFO.name}（以下「当社」といいます）は、当社が提供する {SITE_NAME}
        （以下「本サービス」といいます）における、利用者の個人情報の取扱いについて、
        以下のとおりプライバシーポリシー（以下「本ポリシー」といいます）を定めます。
      </p>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-bold">第1条（個人情報）</h2>
        <p className="text-sm leading-relaxed">
          「個人情報」とは、個人情報保護法にいう「個人情報」を指すものとし、生存する個人に関する
          情報であって、当該情報に含まれる氏名、生年月日、住所、電話番号、連絡先その他の記述等により
          特定の個人を識別できる情報、及び容貌等の身体的特徴から特定の個人を識別できる情報を指します。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-bold">第2条（個人情報の収集方法）</h2>
        <p className="mb-2 text-sm leading-relaxed">
          当社は、利用者が利用登録を行う際や、案件への応募・資料請求を行う際に、
          以下の情報を取得することがあります。
        </p>
        <ul className="list-disc space-y-1 pl-6 text-sm leading-relaxed">
          <li>氏名、フリガナ</li>
          <li>メールアドレス</li>
          <li>電話番号（SMS認証に使用）</li>
          <li>LINE ID（任意入力）</li>
          <li>会社名、業種、所在地等の事業者情報</li>
          <li>応募動機、その他入力フォームに記載された情報</li>
          <li>IPアドレス、ブラウザ情報、端末情報、Cookie等のアクセス情報</li>
          <li>決済に関する情報（Stripeを通じて取得。カード番号は当社では保持しません）</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-bold">第3条（個人情報を収集・利用する目的）</h2>
        <p className="mb-2 text-sm leading-relaxed">当社が個人情報を収集・利用する目的は、以下のとおりです。</p>
        <ol className="list-decimal space-y-1 pl-6 text-sm leading-relaxed">
          <li>本サービスの提供・運営のため</li>
          <li>利用者からのお問い合わせに回答するため</li>
          <li>利用者が希望する案件情報の提供、応募者の情報の募集者への開示のため</li>
          <li>SMS認証による本人確認および不正利用の防止のため</li>
          <li>利用規約に違反した利用者の特定、および本サービスの利用停止等のため</li>
          <li>本サービスの改善、新機能の開発のため</li>
          <li>メンテナンス、重要なお知らせなど必要に応じたご連絡のため</li>
          <li>有料サービスの課金処理のため</li>
          <li>上記の利用目的に付随する目的</li>
        </ol>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-bold">第4条（利用目的の変更）</h2>
        <p className="text-sm leading-relaxed">
          当社は、利用目的が変更前と関連性を有すると合理的に認められる場合に限り、
          個人情報の利用目的を変更するものとします。利用目的の変更を行った場合には、
          変更後の目的について、当社所定の方法により、利用者に通知し、または本ウェブサイト上に
          公表するものとします。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-bold">第5条（個人情報の第三者提供）</h2>
        <ol className="list-decimal space-y-2 pl-6 text-sm leading-relaxed">
          <li>当社は、次に掲げる場合を除いて、あらかじめ利用者の同意を得ることなく、第三者に個人情報を提供することはありません。ただし、個人情報保護法その他の法令で認められる場合を除きます。
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき</li>
              <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき</li>
              <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき</li>
              <li>予め次の事項を告知あるいは公表し、かつ当社が個人情報保護委員会に届出をしたとき
                <ul className="mt-2 list-disc space-y-1 pl-6">
                  <li>利用目的に第三者への提供を含むこと</li>
                  <li>第三者に提供されるデータの項目</li>
                  <li>第三者への提供の手段または方法</li>
                  <li>本人の求めに応じて個人情報の第三者への提供を停止すること</li>
                  <li>本人の求めを受け付ける方法</li>
                </ul>
              </li>
            </ul>
          </li>
          <li>前項の定めにかかわらず、次に掲げる場合には、当該情報の提供先は第三者に該当しないものとします。
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>当社が利用目的の達成に必要な範囲内において個人情報の取扱いの全部または一部を委託する場合</li>
              <li>合併その他の事由による事業の承継に伴って個人情報が提供される場合</li>
              <li>個人情報を特定の者との間で共同して利用する場合であって、その旨並びに共同して利用される個人情報の項目、共同して利用する者の範囲、利用する者の利用目的および当該個人情報の管理について責任を有する者の氏名または名称について、あらかじめ本人に通知し、または本人が容易に知り得る状態に置いた場合</li>
            </ul>
          </li>
        </ol>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-bold">第6条（外部サービスの利用）</h2>
        <p className="mb-2 text-sm leading-relaxed">
          本サービスでは、以下の外部サービスを利用しており、これらのサービス提供者に
          必要な範囲の情報が送信されることがあります。
        </p>
        <ul className="list-disc space-y-2 pl-6 text-sm leading-relaxed">
          <li><strong>Google Firebase</strong>（Google LLC）：認証、データベース、ストレージ、SMS認証</li>
          <li><strong>Stripe</strong>（Stripe, Inc.）：決済処理</li>
          <li><strong>Vercel</strong>（Vercel Inc.）：Webサイトのホスティング</li>
        </ul>
        <p className="mt-2 text-sm leading-relaxed">
          これらの各サービスにおける個人情報の取扱いについては、各社のプライバシーポリシーをご確認ください。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-bold">第7条（個人情報の開示・訂正・削除）</h2>
        <ol className="list-decimal space-y-2 pl-6 text-sm leading-relaxed">
          <li>当社は、本人から個人情報の開示を求められたときは、本人に対し、遅滞なくこれを開示します。ただし、開示することにより次のいずれかに該当する場合は、その全部または一部を開示しないこともあり、開示しない決定をした場合には、その旨を遅滞なく通知します。
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>本人または第三者の生命、身体、財産その他の権利利益を害するおそれがある場合</li>
              <li>当社の業務の適正な実施に著しい支障を及ぼすおそれがある場合</li>
              <li>その他法令に違反することとなる場合</li>
            </ul>
          </li>
          <li>利用者は、本サービスに登録している個人情報の訂正・削除を希望する場合、所定の方法により申請することができます。</li>
          <li>アカウントを削除した場合、当社の定める保持期間経過後、個人情報を削除します。</li>
        </ol>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-bold">第8条（電話番号の取扱い）</h2>
        <p className="mb-2 text-sm leading-relaxed">
          当社は、SMS認証により取得した電話番号を、以下の目的で利用します。
        </p>
        <ul className="list-disc space-y-1 pl-6 text-sm leading-relaxed">
          <li>利用者の本人確認</li>
          <li>不正な利用（なりすまし、スパム、からかい案件の投稿等）の防止</li>
          <li>重要な連絡が必要な場合の連絡手段</li>
        </ul>
        <p className="mt-2 text-sm leading-relaxed">
          電話番号は、当該利用者以外の第三者には開示しません。ただし、
          応募者が募集者に開示を希望する場合、または法令上の要請がある場合はこの限りではありません。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-bold">第9条（Cookie等の利用）</h2>
        <p className="text-sm leading-relaxed">
          本サービスでは、利用者の利便性向上およびログイン状態の維持のために Cookie
          および類似技術を使用しています。利用者は、ブラウザの設定により Cookie
          の受け入れを拒否することができますが、その場合、本サービスの一部の機能が
          利用できなくなることがあります。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-bold">第10条（プライバシーポリシーの変更）</h2>
        <ol className="list-decimal space-y-2 pl-6 text-sm leading-relaxed">
          <li>本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、利用者に通知することなく、変更することができるものとします。</li>
          <li>当社が別途定める場合を除いて、変更後のプライバシーポリシーは、本ウェブサイトに掲載したときから効力を生じるものとします。</li>
        </ol>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-bold">第11条（お問い合わせ窓口）</h2>
        <p className="mb-2 text-sm leading-relaxed">
          本ポリシーに関するお問い合わせは、下記の窓口までお願いいたします。
        </p>
        <div className="rounded-lg bg-gray-50 p-4 text-sm leading-relaxed">
          <p>{COMPANY_INFO.name}</p>
          <p>〒{COMPANY_INFO.postalCode} {COMPANY_INFO.address}</p>
          <p>Email: {COMPANY_INFO.email}</p>
        </div>
      </section>

      <p className="mt-8 text-right text-sm text-gray-600">以上</p>
    </>
  );
}
