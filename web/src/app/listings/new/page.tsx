'use client';

import { ListingForm } from '@/components/listings/ListingForm';
import { useRequireAdvertiser } from '@/hooks/useRequireAdvertiser';

export default function NewListingPage() {
  const { user, advertiser, loading, error } = useRequireAdvertiser();
  if (loading || !user) return <p className="text-center text-sm text-gray-500">読み込み中…</p>;
  if (error || !advertiser) return <p role="alert" className="text-red-600">{error}</p>;
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-xl font-bold">案件を作成</h1>
      <ListingForm advertiser={advertiser} />
    </div>
  );
}
