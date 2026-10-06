'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useListing } from '@/hooks/useListing';
import { useAuth } from '@/providers/AuthProvider';
import { LISTING_STATUS_LABELS } from '@/types';

// ============================================================
// 仮データ（DB に項目が無いものはここで表示）
// Listing 型に項目が追加されたら、ここを listing.xxx に差し替える
// ============================================================
const PLACEHOLDER = {
  companyAddress: '〒171-0022 東京都豊島区南池袋1-16-15 ダイヤゲート池袋',
  representative: '代表取締役　鳥越 洋輔',
  established: '2007年2月',
  businessDescription:
    '電気通信事業法に定める電気通信事業、情報処理サービス業ならびに情報提供サービス業、MVNO事業',
  recommendedFor: [
    '既存の会員・顧客基盤に格安SIMを加えたい',
    '自社ブランドの通信サービスを立ち上げたい',
    '大きな設備投資やシステム開発をせず通信事業へ参入したい',
  ],
  agentFit: [
    '通信事業を始めたい方',
    '仕入れ先を増やしたい方',
    '外国人向けの通信事業者',
    '外国人材の支援事業者',
  ],
  salesTarget: '法人、個人ほか',
  salesMethod: '訪問販売、テレアポ、既存顧客への紹介ほか',
  earnings: '卸価格と貴社販売価格の差益（ストック収益）',
  businessPoints: [
    {
      title: 'SIMは1枚から仕入れ可能。大量在庫を抱えず小さくスタート',
      body: '通信事業に新しく参入するとき、「最初から大量のSIMを仕入れなければならないのでは？」と心配する企業も少なくありません。「格安SIM事業」では、SIMを1枚から仕入れることができ、最低ロットも設けられていません。最初から大きな契約者数を見込んで大量に仕入れるのではなく、実際の販売状況に合わせて事業をスタートできます。\n\n発注方法も、申込書やCSVを使ったシンプルな方法に対応。OEM・再販型では、スマートモバイルコミュニケーションズがSIM卸や開通処理、MNP、SIM物流などを担います。',
    },
    {
      title: 'システム開発は不要。申込書・CSVからはじめられる',
      body: '大規模なシステム開発や大量在庫を前提とせず、申込書やCSVを活用したシンプルな運用からスタート可能です。MVNO事業10年以上の実績を持つ弊社が、回線調達・SIM卸・開通・MNP・物流・二次サポートなどを担います。\n\nSIM・eSIM・端末・モバイルルーター、多彩な容量・通話プランを組み合わせられ、既存顧客への提案によるストック収益も目指せます。',
    },
    {
      title: '今ある顧客基盤に「通信」をプラス。新しいストック収益を目指せる',
      body: '本事業を始めるからといって、必ずしも新しい顧客をゼロから開拓する必要はありません。すでに店舗、会員、入居者、契約世帯などとの接点を持つ企業であれば、既存サービスに「通信」という新しい選択肢を加える形で事業を展開できます。\n\n相性のよい顧客基盤として挙げられているのは、小売・EC、不動産、電力・ガス、シェアリング、スポーツ、外国人材支援などです。',
    },
    {
      title: '収益はストック型。毎月の継続収入が見込める',
      body: '卸価格と貴社販売価格の差益が、そのまま毎月のストック収益になります。通信料は毎月発生するため、エンドユーザー価格と卸価格の差が継続的な収益源となります。',
    },
    {
      title: 'SIMだけでなくeSIMや端末も。顧客に合わせて通信商材を広げられる',
      body: 'データ専用から音声、1GBから100GB、かけ放題やeSIMまで揃い、顧客像に合わせて組み立てられます。スマートフォン端末やモバイルルーターの「THE WiFi」も扱えるため、通信まわりをまとめて提供できます。',
    },
  ],
  keywords: [
    '携帯事業','法人','OEM事業','ストック収益','法人向けSIM','eSIM','スマートフォン',
    '格安SIM法人','MNP','SIM卸','自社ブランド','OEM','SIM販売','通信商材','新規事業',
    '新規事業立ち上げ','再販','モバイルルーター','MVNE','MVNO','通信事業参入',
    '格安SIM事業','SIM再販','SIM','回線卸','通信サービス','モバイル通信',
  ],
  remainingSlots: '10+',
};

export default function ListingPage() {
  const { id } = useParams<{ id: string }>();
  const { listing, loading, error } = useListing(id);
  const { user } = useAuth();

  if (loading) {
    return <p className="py-12 text-center text-sm text-gray-500">読み込み中…</p>;
  }
  if (error || !listing) {
    return (
      <p role="alert" className="py-12 text-center text-sm text-red-600">
        {error}
      </p>
    );
  }

  const isOwner = user?.uid === listing.advertiserId;
  const canApply = listing.status === 'published';

  const keyTiles: { label: string; value: string; small?: string; highlight?: boolean }[] = [
    { label: '加盟金', value: listing.franchiseFeeLabel || '無料', highlight: true },
    { label: '初期費用概算', value: listing.initialCostLabel || '0円', small: '（加盟金以外も不要）', highlight: true },
    { label: '仕入れ', value: listing.stockLabel || '1枚から', small: '在庫リスクなし' },
    { label: '売上推定', value: listing.expectedRevenueLabel || '月額', small: '顧客数次第' },
    { label: '利益推定', value: listing.expectedProfitLabel || '卸価格差益' },
    { label: '収益タイプ', value: listing.revenueTypeLabel || 'ストック型' },
    { label: '組織拡大', value: listing.organizationTypeLabel || '個人も可', small: '組織拡大も' },
    {
      label: '対応エリア',
      value: listing.prefectureLabel || listing.regionLabel || '全国',
    },
  ];

  const allTags = [
    ...(listing.productLabels ?? []),
    ...(listing.targetLabels ?? []),
    ...(listing.modelLabels ?? []),
  ];

  return (
    <article className="mx-auto max-w-6xl">
      {/* パンくず */}
      <nav className="px-1 py-3.5 text-xs text-gray-500">
        <Link href="/" className="hover:underline">ホーム</Link>
        <span className="mx-1.5">&gt;</span>
        <Link href="/listings" className="hover:underline">案件一覧</Link>
        {listing.productLabels?.[0] && (
          <>
            <span className="mx-1.5">&gt;</span>
            <span>{listing.productLabels[0]}</span>
          </>
        )}
        <span className="mx-1.5">&gt;</span>
        <span className="text-gray-700">案件詳細</span>
      </nav>

      {/* ============================================================
          画像スライダー
      ============================================================ */}
      <section className="mb-5 rounded-2xl bg-white p-5">
        <div className="relative flex aspect-[21/9] items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="h-24 w-24 text-gray-300"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <button
            type="button"
            aria-label="前の画像"
            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-gray-700 shadow"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="次の画像"
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-gray-700 shadow"
          >
            ›
          </button>
          <span className="absolute bottom-3.5 right-3.5 rounded-full bg-black/65 px-3 py-1 text-xs text-white">
            1 / 6
          </span>
        </div>
        <div className="mt-3 grid grid-cols-6 gap-2.5">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={
                'aspect-video cursor-pointer rounded-md border-2 ' +
                (i === 0 ? 'border-brand-600' : 'border-transparent')
              }
              style={{
                background:
                  i === 0
                    ? 'linear-gradient(135deg,#dbeafe,#93c5fd)'
                    : i === 1
                    ? 'linear-gradient(135deg,#e0e7ff,#a5b4fc)'
                    : i === 2
                    ? 'linear-gradient(135deg,#fef3c7,#fcd34d)'
                    : i === 3
                    ? 'linear-gradient(135deg,#d1fae5,#6ee7b7)'
                    : i === 4
                    ? 'linear-gradient(135deg,#fce7f3,#f9a8d4)'
                    : 'linear-gradient(135deg,#e9d5ff,#c4b5fd)',
              }}
            />
          ))}
        </div>
      </section>

      {/* ============================================================
          タイトル
      ============================================================ */}
      <section className="mb-5 rounded-2xl bg-white px-8 py-7">
        {allTags.length > 0 && (
          <div className="mb-3.5 flex flex-wrap gap-1.5">
            {allTags.map((label) => (
              <span
                key={label}
                className="rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold text-brand-700"
              >
                {label}
              </span>
            ))}
          </div>
        )}
        <h1 className="mb-3.5 text-2xl font-extrabold leading-snug tracking-tight text-gray-900">
          {listing.title}
        </h1>
        <p className="text-sm text-gray-500">
          募集企業:{' '}
          <strong className="font-bold text-gray-900">
            {listing.companyName || '未設定'}
          </strong>
        </p>
        {listing.status !== 'published' && (
          <p className="mt-3 inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
            {LISTING_STATUS_LABELS[listing.status]}
          </p>
        )}
      </section>

      {/* ============================================================
          募集の要点
      ============================================================ */}
      <section className="mb-5 rounded-2xl bg-white px-7 py-6">
        <h2 className="mb-4 text-base font-extrabold text-gray-900">募集の要点</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {keyTiles.map((tile) => (
            <div
              key={tile.label}
              className={
                'rounded-[10px] border p-3.5 ' +
                (tile.highlight
                  ? 'border-emerald-200 bg-gradient-to-b from-emerald-50 to-emerald-100'
                  : 'border-blue-200 bg-gradient-to-b from-blue-50 to-blue-100')
              }
            >
              <p
                className={
                  'mb-1.5 text-[11px] font-bold tracking-wide ' +
                  (tile.highlight ? 'text-emerald-700' : 'text-blue-800')
                }
              >
                {tile.label}
              </p>
              <p className="text-lg font-extrabold leading-tight text-gray-900">
                {tile.value}
                {tile.small && (
                  <small className="ml-1 text-xs font-semibold text-gray-500">
                    {tile.small}
                  </small>
                )}
              </p>
            </div>
          ))}
        </div>
      </section>

           {/* ============================================================
          こんな方におすすめ
      ============================================================ */}
      <section className="mb-5 rounded-2xl bg-white px-7 py-6">
        <h2 className="mb-3 text-[15px] font-extrabold text-brand-700">
          こんな方におすすめ
        </h2>
        <ul className="space-y-1.5">
          {PLACEHOLDER.recommendedFor.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="flex-shrink-0 font-black text-brand-600">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ============================================================
          2カラムレイアウト
      ============================================================ */}
      <div className="grid gap-7 lg:grid-cols-[360px_minmax(0,1fr)]">
        {/* サイドバー */}
        <aside className="flex flex-col gap-4">
          {/* 募集企業情報 */}
          <div className="rounded-2xl bg-white p-5.5 px-5 py-5">
            <h2 className="mb-3.5 text-[15px] font-extrabold text-brand-700">
              募集企業情報
            </h2>
            <table className="w-full border-collapse text-[13px]">
              <tbody>
                <tr className="border border-gray-200">
                  <th className="w-[88px] bg-gray-50 px-3 py-2.5 text-left align-top font-bold leading-relaxed text-gray-700">
                    企業名
                  </th>
                  <td className="px-3 py-2.5 align-top leading-relaxed text-gray-800">
                    {listing.companyName || '未設定'}
                  </td>
                </tr>
                <tr className="border border-gray-200">
                  <th className="w-[88px] bg-gray-50 px-3 py-2.5 text-left align-top font-bold leading-relaxed text-gray-700">
                    所在地
                  </th>
                  <td className="px-3 py-2.5 align-top leading-relaxed text-gray-800">
                    {PLACEHOLDER.companyAddress}
                  </td>
                </tr>
                <tr className="border border-gray-200">
                  <th className="w-[88px] bg-gray-50 px-3 py-2.5 text-left align-top font-bold leading-relaxed text-gray-700">
                    代表者
                  </th>
                  <td className="px-3 py-2.5 align-top leading-relaxed text-gray-800">
                    {PLACEHOLDER.representative}
                  </td>
                </tr>
                <tr className="border border-gray-200">
                  <th className="w-[88px] bg-gray-50 px-3 py-2.5 text-left align-top font-bold leading-relaxed text-gray-700">
                    設立
                  </th>
                  <td className="px-3 py-2.5 align-top leading-relaxed text-gray-800">
                    {PLACEHOLDER.established}
                  </td>
                </tr>
                <tr className="border border-gray-200">
                  <th className="w-[88px] bg-gray-50 px-3 py-2.5 text-left align-top font-bold leading-relaxed text-gray-700">
                    事業内容
                  </th>
                  <td className="px-3 py-2.5 align-top leading-relaxed text-gray-800">
                    {PLACEHOLDER.businessDescription}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 詳細情報 */}
          <div className="rounded-2xl bg-white p-5">
            <h2 className="mb-3.5 text-[15px] font-extrabold text-brand-700">
              詳細情報
            </h2>
            <table className="w-full border-collapse text-[13px]">
              <tbody>
                <tr className="border border-gray-200">
                  <th className="w-[88px] bg-gray-50 px-3 py-2.5 text-left align-top font-bold leading-relaxed text-gray-700">
                    最適な<br />代理店様
                  </th>
                  <td className="px-3 py-2.5 align-top leading-relaxed text-gray-800">
                    <ul className="space-y-1">
                      {PLACEHOLDER.agentFit.map((item) => (
                        <li key={item} className="flex gap-1.5">
                          <span className="text-gray-400">・</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
                <tr className="border border-gray-200">
                  <th className="w-[88px] bg-gray-50 px-3 py-2.5 text-left align-top font-bold leading-relaxed text-gray-700">
                    販売先
                  </th>
                  <td className="px-3 py-2.5 align-top leading-relaxed text-gray-800">
                    {PLACEHOLDER.salesTarget}
                  </td>
                </tr>
                <tr className="border border-gray-200">
                  <th className="w-[88px] bg-gray-50 px-3 py-2.5 text-left align-top font-bold leading-relaxed text-gray-700">
                    販売方法
                  </th>
                  <td className="px-3 py-2.5 align-top leading-relaxed text-gray-800">
                    {PLACEHOLDER.salesMethod}
                  </td>
                </tr>
                <tr className="border border-gray-200">
                  <th className="w-[88px] bg-gray-50 px-3 py-2.5 text-left align-top font-bold leading-relaxed text-gray-700">
                    収益
                  </th>
                  <td className="px-3 py-2.5 align-top leading-relaxed text-gray-800">
                    {PLACEHOLDER.earnings}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 資料ダウンロード（サイドバー） */}
          {canApply && (
            <div className="rounded-2xl bg-gradient-to-b from-orange-50 to-orange-100 p-5.5 px-5 py-5">
              <p className="mb-2.5 text-xs font-bold text-orange-700">
                資料請求は無料です
              </p>
              <Link
                href={`/listings/${id}/apply`}
                className="block rounded-lg bg-orange-600 py-3.5 text-center text-[15px] font-extrabold text-white shadow-md hover:bg-orange-700"
              >
                資料ダウンロード
              </Link>
            </div>
          )}

          {isOwner && (
            <Link
              href={`/listings/${id}/edit`}
              className="block rounded-2xl border border-gray-200 bg-white px-4 py-3 text-center text-sm text-brand-700 hover:bg-gray-50"
            >
              案件を編集
            </Link>
          )}
        </aside>

        {/* メインカラム */}
        <div>
          {/* ビジネスの説明 */}
          <section className="mb-5 rounded-2xl bg-white p-7">
            <h2 className="mb-4.5 border-b-2 border-brand-50 pb-2.5 text-lg font-extrabold text-brand-700">
              ビジネスの説明
            </h2>
            <div className="space-y-5">
              {PLACEHOLDER.businessPoints.map((point, i) => (
                <div key={point.title} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-[15px] font-extrabold text-brand-700">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2.5 text-base font-extrabold leading-snug text-gray-900">
                      {point.title}
                    </h3>
                    {point.body.split('\n\n').map((para, j) => (
                      <p key={j} className="mb-2 text-sm leading-relaxed text-gray-700 last:mb-0">
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 資料ダウンロード CTA */}
          {canApply && (
            <section className="mb-5 rounded-2xl bg-gradient-to-b from-orange-50 to-orange-100 p-8 text-center">
              <p className="mb-1.5 text-[15px] font-bold text-orange-800">
                資料請求は無料！定員に達し次第終了します！
              </p>
              <Link
                href={`/listings/${id}/apply`}
                className="my-4 inline-block rounded-lg bg-orange-600 px-16 py-4 text-lg font-extrabold text-white shadow-[0_4px_14px_rgba(234,88,12,0.3)] hover:bg-orange-700"
              >
                資料ダウンロード
              </Link>
              <p className="text-xs text-orange-700">
                残り {PLACEHOLDER.remainingSlots}
              </p>
            </section>
          )}

          {!canApply && (
            <p className="mb-5 rounded-2xl bg-gray-100 p-6 text-center text-sm text-gray-600">
              現在この案件への応募は受け付けていません。
            </p>
          )}

          {/* 資料プレビュー（重ね表示） */}
          <div className="mx-auto mb-5 max-w-[420px] px-2 py-10">
            <div className="relative" style={{ aspectRatio: '1 / 1.3' }}>
              {/* 奥の2枚 */}
              <div
                className="absolute inset-0 rounded-xl border border-gray-200 bg-white shadow-[0_6px_20px_rgba(0,0,0,0.06)]"
                style={{ transform: 'rotate(-4deg) translate(-14px, 4px)' }}
              />
              <div
                className="absolute inset-0 rounded-xl border border-gray-200 bg-white shadow-[0_6px_20px_rgba(0,0,0,0.06)]"
                style={{ transform: 'rotate(2deg) translate(10px, 2px)' }}
              />
              {/* 前面 */}
              <div className="relative z-10 flex h-full w-full flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-8 shadow-[0_8px_28px_rgba(0,0,0,0.1)]">
                <div className="flex h-full w-full flex-col items-center justify-center rounded-lg bg-gradient-to-b from-gray-50 to-gray-100 px-8 py-10 text-center">
                  <div className="mb-6 h-15 w-15 rounded-xl bg-brand-50" />
                  <p className="mb-2 text-[13px] text-gray-500">
                    パートナー募集資料
                  </p>
                  <h3 className="mb-5 text-xl font-bold leading-snug text-gray-900">
                    「{listing.title.slice(0, 20)}」<br />パートナー募集
                  </h3>
                  <p className="max-w-[320px] text-[13px] text-gray-500">
                    貴社ブランドで展開できる、新しいビジネスのご提案です。
                  </p>
                  <p className="mt-6 text-xs text-gray-500">
                    2026年 ｜ {listing.companyName || '募集企業'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* キーワード */}
          <section className="mb-5 rounded-2xl bg-white p-7">
            <h2 className="mb-4.5 border-b-2 border-brand-50 pb-2.5 text-lg font-extrabold text-brand-700">
              関連キーワード
            </h2>
            <p className="mb-3.5 text-[13px] text-gray-500">
              {PLACEHOLDER.keywords.join(', ')}
            </p>
            <div className="flex flex-wrap gap-2">
              {allTags.map((kw) => (
                <span
                  key={kw}
                  className="rounded-md border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700 hover:border-brand-600 hover:text-brand-700"
                >
                  {kw}
                </span>
              ))}
              {listing.prefectureLabel && (
                <span className="rounded-md border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700">
                  {listing.prefectureLabel}
                </span>
              )}
              {listing.initialCostLabel && (
                <span className="rounded-md border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700">
                  {listing.initialCostLabel}
                </span>
              )}
            </div>
          </section>

          <Link
            href="/listings"
            className="mx-auto block max-w-[480px] rounded-[10px] border border-brand-600 py-4 text-center text-sm font-bold text-brand-700 hover:bg-brand-50"
          >
            このカテゴリーの一覧を見る ›
          </Link>
        </div>
      </div>
    </article>
  );
}
