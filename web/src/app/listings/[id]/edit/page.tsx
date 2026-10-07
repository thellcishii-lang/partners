'use client';

import { useParams } from 'next/navigation';
import { ListingForm } from '@/components/listings/ListingForm';
import { useRequireAdvertiser } from '@/hooks/useRequireAdvertiser';
import { useListing } from '@/hooks/useListing';

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const { user, advertiser, loading, error } = useRequireAdvertiser();
  const state = useListing(id);
  if (loading || !user || state.loading) return <p className="text-center text-sm text-gray-500">読み込み中…</p>;
  if (error || state.error) return <p role="alert" className="text-red-600">{error || state.error}</p>;
  if (!advertiser || !state.listing || state.listing.advertiserId !== user.uid) {
    return <p role="alert" className="text-red-600">この案件は編集できません。</p>;
  }
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-xl font-bold">案件を編集</h1>
      <ListingForm key={id} advertiser={advertiser} listing={state.listing} />
    </div>
  );
}
