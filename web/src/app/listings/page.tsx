import type { Metadata } from 'next';
import { ListingsSearch } from '@/components/listings/ListingsSearch';
import { getAllServerListings } from '@/lib/serverListings';
import type { Listing } from '@/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '案件を探す｜代理店・加盟店・FCの募集一覧',
  description: '全国の代理店・加盟店・フランチャイズ（FC）の募集案件を探せます。AI・通信・美容・住宅など業種別、全国の地域別、初期費用や加盟金などの条件で絞り込んで検索できます。',
  alternates: { canonical: '/listings' },
  openGraph: {
    title: '案件を探す｜代理店・加盟店・FCの募集一覧',
    description: '全国の代理店・加盟店・FCの募集案件を探せます。業種・地域・費用などの条件で絞り込んで検索できます。',
    url: '/listings',
  },
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
