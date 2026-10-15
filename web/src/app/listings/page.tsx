import type { Metadata } from 'next';
import { ListingsSearch } from '@/components/listings/ListingsSearch';
import { getAllServerListings } from '@/lib/serverListings';
import type { Listing } from '@/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  alternates: { canonical: '/listings' },
};

export default async function ListingsPage() {
  let initialListings: Listing[] = [];
  let initialError = '';

  try {
    initialListings = await getAllServerListings();
  } catch (error) {
    console.error('ListingsPage: failed to fetch listings', error);
    initialError = '案件一覧の取得に失敗しました。';
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">案件を探す</h1>
      <ListingsSearch
        initialListings={initialListings}
        initialError={initialError}
        renderedAt={Date.now()}
      />
    </div>
  );
}
