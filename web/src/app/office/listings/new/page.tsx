'use client';

import Link from 'next/link';
import { ListingForm } from '@/components/listings/ListingForm';
import { useRequireAdvertiser } from '@/hooks/useRequireAdvertiser';

export default function OfficeNewListingPage() {
  const { user, advertiser, loading, error } = useRequireAdvertiser();
  if (loading || !user) return <p className="text-center text-sm text-gray-500">読み込み中…</p>;
  if (error || !advertiser) return <p role="alert" className="text-red-600">{error}</p>;
  
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/office" className="text-xs text-gray-500 hover:underline">
          ← 法人向け専門トップ
        </Link>
        <h1 className="mt-1 text-xl font-bold text-slate-700">オフィス・法人向け案件を作成</h1>
      </div>
      <ListingForm advertiser={advertiser} industry="office" />
    </div>
  );
}
