'use client';

import Link from 'next/link';
import { ListingForm } from '@/components/listings/ListingForm';
import { useRequireAdvertiser } from '@/hooks/useRequireAdvertiser';

export default function RealestateNewListingPage() {
  const { user, advertiser, loading, error } = useRequireAdvertiser();
  if (loading || !user) return <p className="text-center text-sm text-gray-500">読み込み中…</p>;
  if (error || !advertiser) return <p role="alert" className="text-red-600">{error}</p>;
  
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/realestate" className="text-xs text-gray-500 hover:underline">
          ← 不動産専門トップ
        </Link>
        <h1 className="mt-1 text-xl font-bold text-stone-700">建築・不動産向け案件を作成</h1>
      </div>
      <ListingForm advertiser={advertiser} industry="realestate" />
    </div>
  );
}
