'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useListing } from '@/hooks/useListing';
import { useAuth } from '@/providers/AuthProvider';
import { LISTING_STATUS_LABELS } from '@/types';

export default function ListingPage() {
  const { id } = useParams<{ id: string }>();
  const { listing, loading, error } = useListing(id);
  const { user } = useAuth();
  const [imageIndex, setImageIndex] = useState(0);

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
  const images = listing.images ?? [];
  const recommendedFor = listing.recommendedFor ?? [];
  const businessPoints = listing.businessPoints ?? [];
  const agentFit = listing.agentFit ?? [];

  const keyTiles: { label: string; value: string; small?: string; highlight?: boolean }[] = [
    { label: '加盟金', value: listing.franchiseFeeLabel || '応相談', highlight: listing.franchiseFeeYen === 0 },
    { label: '初期費用概算', value: listing.initialCostLabel || '応相談', highlight: listing.initialCostRange === 'initial-free' },
    { label: '仕入れ', value: listing.stockLabel || '—' },
    { label: '売上推定', value: listing.expectedRevenueLabel || '応相談' },
    { label: '利益推定', value: listing.expectedProfitLabel || '—' },
    { label: '収益タイプ', value: listing.revenueTypeLabel || '—' },
    { label: '組織拡大', value: listing.organizationTypeLabel || '—' },
    { label: '対応エリア', value: listing.prefectureLabel || listing.regionLabel || '全国' },
  ];

  const allTags = [
    ...(listing.productLabels ?? []),
    ...(listing.targetLabels ?? []),
    ...(listing.modelLabels ?? []),
  ];

  return (
    <article className="mx-auto max-w-6xl">
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

      <section className="mb-5 rounded-2xl bg-white p-5">
        {images.length > 0 ? (
          <>
            <div className="relative flex aspect-[21/9] items-center justify-center overflow-hidden rounded-xl bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[Math.min(imageIndex, images.length - 1)]}
                alt={listing.title}
                className="h-full w-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="前の画像"
                    onClick={() => setImageIndex((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white bg-opacity-90 text-xl text-gray-700 shadow"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    aria-label="次の画像"
                    onClick={() => setImageIndex((i) => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white bg-opacity-90 text-xl text-gray-700 shadow"
                  >
                    ›
                  </button>
                </>
              )}
              <span className="absolute bottom-3.5 right-3.5 rounded-full bg-black bg-opacity-60 px-3 py-1 text-xs text-white">
                {Math.min(imageIndex, images.length - 1) + 1} / {images.length}
              </span>
            </div>
            {images.length > 1 && (
              <div className="mt-3 grid grid-cols-6 gap-2.5">
                {images.map((url, i) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setImageIndex(i)}
                    className={
                      'aspect-video overflow-hidden rounded-md border-2 transition ' +
                      (i === imageIndex
                        ? 'border-emerald-600'
                        : 'border-transparent opacity-70 hover:opacity-100')
                    }
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
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
            <span className="absolute bottom-3.5 right-3.5 rounded-full bg-black bg-opacity-60 px-3 py-1 text-xs text-white">
              画像未設定
            </span>
          </div>
        )}
      </section>

      <section className="mb-5 rounded-2xl bg-white px-8 py-7">
        {allTags.length > 0 && (
          <div className="mb-3.5 flex flex-wrap gap-1.5">
            {allTags.map((label) => (
              <span
                key={label}
                className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700"
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
                  : 'border-emerald-100 bg-gradient-to-b from-emerald-50 to-emerald-50')
              }
            >
              <p className="mb-1.5 text-[11px] font-bold tracking-wide text-emerald-700">
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

      {recommendedFor.length > 0 && (
        <section className="mb-5 rounded-2xl bg-white px-7 py-6">
          <h2 className="mb-3 text-[15px] font-extrabold text-emerald-700">
            こんな方におすすめ
          </h2>
          <ul className="space-y-1.5">
            {recommendedFor.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="flex-shrink-0 font-black text-emerald-600">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-7 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-4">
          <div className="rounded-2xl bg-white px-5 py-5">
            <h2 className="mb-3.5 text-[15px] font-extrabold text-emerald-700">
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
                {listing.companyAddress && (
                  <tr className="border border-gray-200">
                    <th className="w-[88px] bg-gray-50 px-3 py-2.5 text-left align-top font-bold leading-relaxed text-gray-700">
                      所在地
                    </th>
                    <td className="px-3 py-2.5 align-top leading-relaxed text-gray-800">
                      {listing.companyAddress}
                    </td>
                  </tr>
                )}
                {listing.companyRepresentative && (
                  <tr className="border border-gray-200">
                    <th className="w-[88px] bg-gray-50 px-3 py-2.5 text-left align-top font-bold leading-relaxed text-gray-700">
                      代表者
                    </th>
                    <td className="px-3 py-2.5 align-top leading-relaxed text-gray-800">
                      {listing.companyRepresentative}
                    </td>
                  </tr>
                )}
                {listing.companyEstablished && (
                  <tr className="border border-gray-200">
                    <th className="w-[88px] bg-gray-50 px-3 py-2.5 text-left align-top font-bold leading-relaxed text-gray-700">
                      設立
                    </th>
                    <td className="px-3 py-2.5 align-top leading-relaxed text-gray-800">
                      {listing.companyEstablished}
                    </td>
                  </tr>
                )}
                {listing.companyBusiness && (
                  <tr className="border border-gray-200">
                    <th className="w-[88px] bg-gray-50 px-3 py-2.5 text-left align-top font-bold leading-relaxed text-gray-700">
                      事業内容
                    </th>
                    <td className="px-3 py-2.5 align-top leading-relaxed text-gray-800">
                      {listing.companyBusiness}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl bg-white p-5">
            <h2 className="mb-3.5 text-[15px] font-extrabold text-emerald-700">
              詳細情報
            </h2>
            <table className="w-full border-collapse text-[13px]">
              <tbody>
                {agentFit.length > 0 && (
                  <tr className="border border-gray-200">
                    <th className="w-[88px] bg-gray-50 px-3 py-2.5 text-left align-top font-bold leading-relaxed text-gray-700">
                      最適な<br />代理店様
                    </th>
                    <td className="px-3 py-2.5 align-top leading-relaxed text-gray-800">
                      <ul className="space-y-1">
                        {agentFit.map((item) => (
                          <li key={item} className="flex gap-1.5">
                            <span className="text-gray-400">・</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                )}
                {listing.salesTarget && (
                  <tr className="border border-gray-200">
                    <th className="w-[88px] bg-gray-50 px-3 py-2.5 text-left align-top font-bold leading-relaxed text-gray-700">
                      販売先
                    </th>
                    <td className="px-3 py-2.5 align-top leading-relaxed text-gray-800">
                      {listing.salesTarget}
                    </td>
                  </tr>
                )}
                {listing.salesMethod && (
                  <tr className="border border-gray-200">
                    <th className="w-[88px] bg-gray-50 px-3 py-2.5 text-left align-top font-bold leading-relaxed text-gray-700">
                      販売方法
                    </th>
                    <td className="px-3 py-2.5 align-top leading-relaxed text-gray-800">
                      {listing.salesMethod}
                    </td>
                  </tr>
                )}
                {listing.earnings && (
                  <tr className="border border-gray-200">
                    <th className="w-[88px] bg-gray-50 px-3 py-2.5 text-left align-top font-bold leading-relaxed text-gray-700">
                      収益
                    </th>
                    <td className="px-3 py-2.5 align-top leading-relaxed text-gray-800">
                      {listing.earnings}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {canApply && (
            <div className="rounded-2xl bg-gradient-to-b from-orange-50 to-orange-100 px-5 py-5">
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
              className="block rounded-2xl border border-gray-200 bg-white px-4 py-3 text-center text-sm text-emerald-700 hover:bg-gray-50"
            >
              案件を編集
            </Link>
          )}
        </aside>

        <div>
          <section className="mb-5 rounded-2xl bg-white p-7">
            <h2 className="mb-4.5 border-b-2 border-emerald-50 pb-2.5 text-lg font-extrabold text-emerald-700">
              ビジネスの説明
            </h2>
            {businessPoints.length > 0 ? (
              <div className="space-y-5">
                {businessPoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[15px] font-extrabold text-emerald-700">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      {point.title && (
                        <h3 className="mb-2.5 text-base font-extrabold leading-snug text-gray-900">
                          {point.title}
                        </h3>
                      )}
                      {point.body &&
                        point.body.split('\n\n').map((para, j) => (
                          <p
                            key={j}
                            className="mb-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-700 last:mb-0"
                          >
                            {para}
                          </p>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                {listing.description || '情報準備中です。'}
              </div>
            )}
          </section>

          {listing.requirements && (
            <section className="mb-5 rounded-2xl bg-white p-7">
              <h2 className="mb-4.5 border-b-2 border-emerald-50 pb-2.5 text-lg font-extrabold text-emerald-700">
                応募条件
              </h2>
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                {listing.requirements}
              </div>
            </section>
          )}

          {listing.royalty && (
            <section className="mb-5 rounded-2xl bg-white p-7">
              <h2 className="mb-4.5 border-b-2 border-emerald-50 pb-2.5 text-lg font-extrabold text-emerald-700">
                ロイヤリティ
              </h2>
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                {listing.royalty}
              </div>
            </section>
          )}

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
              <p className="text-xs text-orange-700">残り 10+</p>
            </section>
          )}

          {!canApply && (
            <p className="mb-5 rounded-2xl bg-gray-100 p-6 text-center text-sm text-gray-600">
              現在この案件への応募は受け付けていません。
            </p>
          )}

          <div className="mx-auto mb-5 max-w-[420px] px-2 py-10">
            <div className="relative" style={{ aspectRatio: '1 / 1.3' }}>
              <div
                className="absolute inset-0 rounded-xl border border-gray-200 bg-white shadow-[0_6px_20px_rgba(0,0,0,0.06)]"
                style={{ transform: 'rotate(-4deg) translate(-14px, 4px)' }}
              />
              <div
                className="absolute inset-0 rounded-xl border border-gray-200 bg-white shadow-[0_6px_20px_rgba(0,0,0,0.06)]"
                style={{ transform: 'rotate(2deg) translate(10px, 2px)' }}
              />
              <div className="relative z-10 flex h-full w-full flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-8 shadow-[0_8px_28px_rgba(0,0,0,0.1)]">
                <div className="flex h-full w-full flex-col items-center justify-center rounded-lg bg-gradient-to-b from-gray-50 to-gray-100 px-8 py-10 text-center">
                  <div className="mb-6 h-15 w-15 rounded-xl bg-emerald-50" />
                  <p className="mb-2 text-[13px] text-gray-500">パートナー募集資料</p>
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

          {allTags.length > 0 && (
            <section className="mb-5 rounded-2xl bg-white p-7">
              <h2 className="mb-4.5 border-b-2 border-emerald-50 pb-2.5 text-lg font-extrabold text-emerald-700">
                関連キーワード
              </h2>
              <div className="flex flex-wrap gap-2">
                {allTags.map((kw) => (
                  <span
                    key={kw}
                    className="rounded-md border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700 hover:border-emerald-600 hover:text-emerald-700"
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
          )}

          <Link
            href="/listings"
            className="mx-auto block max-w-[480px] rounded-[10px] border border-emerald-600 py-4 text-center text-sm font-bold text-emerald-700 hover:bg-emerald-50"
          >
            このカテゴリーの一覧を見る ›
          </Link>
        </div>
      </div>
    </article>
  );
}
