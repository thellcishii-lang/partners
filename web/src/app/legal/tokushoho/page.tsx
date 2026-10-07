import type { Metadata } from 'next';
import { COMPANY_INFO, SITE_NAME, SITE_URL } from '@/lib/companyInfo';

export const metadata: Metadata = {
  title: `特定商取引法に基づく表記 | ${SITE_NAME}`,
};

export default function TokushohoPage() {
  const rows: [string, React.ReactNode][] = [
    ['販売業者', COMPANY_INFO.name],
    ['代表責任者', COMPANY_INFO.representative],
    ['所在地', `〒${COMPANY_INFO.postalCode} ${COMPANY_INFO.address}`],
    ['電話番号', COMPANY_INFO.phone],
    ['メールアドレス', COMPANY_INFO.email],
    ['販売URL', SITE_URL],
    [
      '販売価格',
      <>
        デポジット1件あたり 2,500円（税込）
        <br />
        販売単位：10,000円（4件分）／ 30,000円（12件分）／
        30,000円を超える2,500円単位の任意金額（上限2,500,000円）
      </>,
    ],
    [
      '商品代金以外の必要料金',
      <>
        ・インターネット接続料金、通信料金等はお客様のご負担となります
        <br />
        ・決済手数料は当社負担
      </>,
    ],
    [
      'お支払い方法',
      'クレジットカード決済（Stripe）',
    ],
    [
      'お支払い時期',
      'クレジットカード決済：ご注文確定時',
    ],
    [
      '役務の提供時期',
      <>
        決済完了後、直ちにデポジットが加算されます。
        <br />
        応募者の情報開示は、募集者が開示操作を行った時点で反映されます。
      </>,
    ],
    [
      '返品・キャンセルについて',
      <>
        商品の性質上、購入後の返金・キャンセルはお受けしておりません。
        <br />
        ただし、決済エラー等の当社の責めに帰すべき事由による場合は、この限りではありません。
      </>,
    ],
    [
      '動作環境',
      <>
        推奨ブラウザ：最新版の Google Chrome / Safari / Firefox / Microsoft Edge
        <br />
        JavaScript および Cookie を有効にしてください。
      </>,
    ],
  ];

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">特定商取引法に基づく表記</h1>

      <p className="mb-6 text-sm leading-relaxed">
        特定商取引法第11条に基づき、以下のとおり表記いたします。
      </p>

      <table className="w-full border-collapse text-sm">
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} className="border border-gray-200">
              <th className="w-40 bg-gray-50 p-3 text-left align-top font-bold text-gray-700">
                {label}
              </th>
              <td className="p-3 align-top leading-relaxed text-gray-800">
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-8 text-right text-sm text-gray-600">以上</p>
    </>
  );
}
