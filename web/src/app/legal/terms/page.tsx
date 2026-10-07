import type { Metadata } from 'next';
import { COMPANY_INFO, SITE_NAME } from '@/lib/companyInfo';

export const metadata: Metadata = {
  title: `利用規約 | ${SITE_NAME}`,
};

export default function TermsPage() {
  const today = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">利用規約</h1>
      <p className="mb-6 text-sm text-gray-600">
        最終更新日：{today}
      </p>

      <p className="mb-6 text-sm leading-relaxed">
        本利用規約（以下「本規約」といいます）は、{COMPANY_INFO.name}（以下「当社」といいます）が
        提供する {SITE_NAME}（以下「本サービス」といいます）の利用条件を定めるものです。
        本サービスをご利用になる方（以下「利用者」といいます）は、本規約に同意のうえ、
        本サービスをご利用いただくものとします。
      </p>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-bold">第1条（適用）</h2>
        <p className="text-sm leading-relaxed">
          本規約は、利用者と当社との間の本サービスの利用に関わる一切の関係に適用されます。
          当社は本サービスに関し、本規約のほか、利用にあたってのルール等を定めることがあります。
          これらのルールは、その名称のいかんに関わらず、本規約の一部を構成するものとします。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-bold">第2条（利用登録）</h2>
        <ol className="list-decimal space-y-2 pl-6 text-sm leading-relaxed">
          <li>本サービスにおいては、登録希望者が本規約に同意のうえ、当社の定める方法によって利用登録を申請し、当社がこれを承認することによって、利用登録が完了するものとします。</li>
          <li>当社は、利用登録の申請者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあり、その理由については一切の開示義務を負わないものとします。
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>利用登録の申請に際して虚偽の事項を届け出た場合</li>
              <li>本規約に違反したことがある者からの申請である場合</li>
              <li>反社会的勢力等である、または資金提供その他を通じて反社会的勢力等の維持、運営もしくは経営に協力もしくは関与する等、反社会的勢力等との何らかの交流もしくは関与を行っていると当社が判断した場合</li>
              <li>その他、当社が利用登録を相当でないと判断した場合</li>
            </ul>
          </li>
          <li>当社は、SMS（ショートメッセージサービス）による電話番号認証を実施することがあります。認証に用いられた電話番号は、本サービスの適正な運営および不正利用防止の目的で利用します。</li>
        </ol>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-bold">第3条（アカウントの管理）</h2>
        <ol className="list-decimal space-y-2 pl-6 text-sm leading-relaxed">
          <li>利用者は、自己の責任において、本サービスのアカウント情報を適切に管理するものとします。</li>
          <li>利用者は、いかなる場合にも、アカウントを第三者に譲渡し、または貸与することはできません。</li>
          <li>アカウント情報が第三者によって使用されたことによって生じた損害は、当社に故意または重大な過失がある場合を除き、当社は一切の責任を負いません。</li>
        </ol>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-bold">第4条（利用料金および支払方法）</h2>
        <ol className="list-decimal space-y-2 pl-6 text-sm leading-relaxed">
          <li>募集者は、当社が別途定めるデポジット（1件あたり2,500円）を購入することにより、応募者の詳細情報の開示を受けられます。</li>
          <li>決済は Stripe を通じて行われ、利用者は Stripe の定める規約にも同意するものとします。</li>
          <li>購入済みのデポジットは、当社が定める有効期間内に限り利用できます。</li>
          <li>法令上の義務がある場合を除き、購入後の返金は行いません。</li>
        </ol>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-bold">第5条（禁止事項）</h2>
        <p className="mb-2 text-sm leading-relaxed">利用者は、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
        <ul className="list-disc space-y-1 pl-6 text-sm leading-relaxed">
          <li>法令または公序良俗に違反する行為</li>
          <li>犯罪行為に関連する行為</li>
          <li>本サービスの内容等、本サービスに含まれる著作権、商標権ほか知的財産権を侵害する行為</li>
          <li>当社、ほかの利用者、またはその他第三者のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
          <li>本サービスによって得られた情報を商業的に利用する行為</li>
          <li>当社のサービスの運営を妨害するおそれのある行為</li>
          <li>不正アクセスをし、またはこれを試みる行為</li>
          <li>他の利用者に関する個人情報等を収集または蓄積する行為</li>
          <li>不正な目的を持って本サービスを利用する行為</li>
          <li>虚偽の情報を登録する行為</li>
          <li>実際に提供する意思のない商材・案件を掲載する行為</li>
          <li>他の利用者に成りすます行為</li>
          <li>当社が許諾しない本サービス上での宣伝、広告、勧誘、または営業行為</li>
          <li>面識のない異性との出会いを目的とした行為</li>
          <li>当社のサービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為</li>
          <li>その他、当社が不適切と判断する行為</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-bold">第6条（本サービスの提供の停止等）</h2>
        <ol className="list-decimal space-y-2 pl-6 text-sm leading-relaxed">
          <li>当社は、以下のいずれかの事由があると判断した場合、利用者に事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
              <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
              <li>コンピュータまたは通信回線等が事故により停止した場合</li>
              <li>その他、当社が本サービスの提供が困難と判断した場合</li>
            </ul>
          </li>
          <li>当社は、本サービスの提供の停止または中断により、利用者または第三者が被ったいかなる不利益または損害についても、一切の責任を負わないものとします。</li>
        </ol>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-bold">第7条（著作権）</h2>
        <ol className="list-decimal space-y-2 pl-6 text-sm leading-relaxed">
          <li>利用者は、自ら著作権等の必要な知的財産権を有するか、または必要な権利者の許諾を得た文章、画像等の情報に関してのみ、本サービスを利用し、投稿することができるものとします。</li>
          <li>利用者が本サービスを利用して投稿した文章、画像等の著作権は、当該利用者または既存の権利者に帰属します。</li>
          <li>当社は、利用者が投稿した情報を、本サービスの宣伝、改善、その他当社が必要と判断する目的で利用できるものとします。</li>
        </ol>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-bold">第8条（利用制限および登録抹消）</h2>
        <p className="text-sm leading-relaxed">
          当社は、利用者が以下のいずれかに該当する場合、事前の通知なく、投稿データを削除し、
          利用者に対して本サービスの全部もしくは一部の利用を制限し、または利用者としての登録を
          抹消することができるものとします。
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-sm leading-relaxed">
          <li>本規約のいずれかの条項に違反した場合</li>
          <li>登録事項に虚偽の事実があることが判明した場合</li>
          <li>当社からの連絡に対し、一定期間返答がない場合</li>
          <li>その他、当社が本サービスの利用を適当でないと判断した場合</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-bold">第9条（免責事項）</h2>
        <ol className="list-decimal space-y-2 pl-6 text-sm leading-relaxed">
          <li>当社は、本サービスに事実上または法律上の瑕疵がないことを明示的にも黙示的にも保証しておりません。</li>
          <li>当社は、本サービスに起因して利用者に生じたあらゆる損害について、当社の故意または重大な過失による場合を除き、一切の責任を負いません。</li>
          <li>当社は、利用者間で行われる取引・連絡・交渉等について、一切関与せず、これらに関する責任を負いません。</li>
          <li>募集者と応募者の間で生じた紛争は、当事者間で解決するものとします。</li>
        </ol>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-bold">第10条（サービス内容の変更等）</h2>
        <p className="text-sm leading-relaxed">
          当社は、利用者への事前の告知をもって、本サービスの内容を変更、追加または廃止することが
          あり得るものとし、利用者はこれを承諾するものとします。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-bold">第11条（利用規約の変更）</h2>
        <p className="text-sm leading-relaxed">
          当社は、必要と判断した場合には、利用者に通知することなくいつでも本規約を変更することが
          できるものとします。なお、本規約の変更後、本サービスの利用を開始した場合には、当該
          利用者は変更後の規約に同意したものとみなします。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-bold">第12条（個人情報の取扱い）</h2>
        <p className="text-sm leading-relaxed">
          当社は、本サービスの利用によって取得する個人情報については、当社
          「<a href="/legal/privacy" className="text-brand-700 underline">プライバシーポリシー</a>」
          に従い適切に取り扱うものとします。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-bold">第13条（通知または連絡）</h2>
        <p className="text-sm leading-relaxed">
          利用者と当社との間の通知または連絡は、当社の定める方法によって行うものとします。
          当社は、利用者から、当社が別途定める方式に従った変更届け出がない限り、現在登録されている
          連絡先が有効なものと推定して通知または連絡を行い、これらは発信時に利用者へ到達したものと
          みなします。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-bold">第14条（権利義務の譲渡の禁止）</h2>
        <p className="text-sm leading-relaxed">
          利用者は、当社の書面による事前の承諾なく、利用契約上の地位または本規約に基づく権利もしくは
          義務につき、第三者に対し、譲渡、移転、担保設定、その他の処分をすることはできません。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-bold">第15条（準拠法・裁判管轄）</h2>
        <ol className="list-decimal space-y-2 pl-6 text-sm leading-relaxed">
          <li>本規約の解釈にあたっては、日本法を準拠法とします。</li>
          <li>本サービスに関して紛争が生じた場合には、当社の本店所在地を管轄する裁判所を専属的合意管轄とします。</li>
        </ol>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-bold">お問い合わせ</h2>
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
