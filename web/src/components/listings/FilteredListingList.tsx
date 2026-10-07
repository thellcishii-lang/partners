import Link from 'next/link';
import { getServerListings, type FilterKey } from '@/lib/serverListings';
import type { Listing } from '@/types';

export async function FilteredListingList({
  filterKey,
  filterValue,
  heading,
  description,
}: {
  filterKey: FilterKey;
  filterValue: string;
  heading: string;
  description?: string;
}) {
  let listings: Listing[] = [];
  let error = '';

  try {
    listings = await getServerListings(filterKey, filterValue);
  } catch (e) {
    error = e instanceof Error ? e.message : '案件一覧の取得に失敗しました。';
    console.error('getServerListings failed', { filterKey, filterValue, error: e });
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">{heading}</h1>
        {description && (
          <p className="mt-2 text-sm text-gray-600">{description}</p>
        )}
      </header>

      {error && (
        <p role="alert" className="text-red-600">{error}</p>
      )}

      {!error && (
        <>
          <p className="text-sm text-gray-600">{listings.length}件の案件</p>

          {listings.length === 0 && (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <p className="text-gray-600">現在、該当する案件はありません。</p>
              <p className="mt-2 text-sm text-gray-500">
                新しい案件が登録されると、ここに表示されます。
              </p>
              <Link
                href="/listings"
                className="mt-4 inline-block text-sm text-brand-700 underline"
              >
                すべての案件を見る
              </Link>
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                href={`/listings/${listing.id}`}
                className="space-y-3 rounded-2xl bg-white p-6 shadow-sm hover:ring-2 hover:ring-brand-500"
              >
                <div className="flex flex-wrap gap-1">
                  {listing.productLabels?.slice(0, 2).map((label) => (
                    <span
                      key={label}
                      className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700"
                    >
                      {label}
                    </span>
                  ))}
                </div>
                <h2 className="text-lg font-bold">{listing.title}</h2>
                <p className="text-sm text-gray-600">会社名：{listing.companyName || '未設定'}</p>
                <p className="text-sm">エリア：{listing.prefectureLabel || listing.area || '応相談'}</p>
                <p className="text-sm">初期費用：{listing.initialCostLabel || '応相談'}</p>
                <p className="whitespace-pre-wrap text-sm">報酬：{listing.reward || '応相談'}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
