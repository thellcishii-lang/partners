'use client';

import { useParams } from 'next/navigation';
import { useListing } from '@/hooks/useListing';
import { useAuth } from '@/providers/AuthProvider';
import { ListingDetail } from '@/components/listings/ListingDetail';

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
  const isPublished = listing.status === 'published';

  return (
    <ListingDetail
      listing={listing}
      applyHref={isPublished ? `/listings/${id}/apply` : undefined}
      editHref={isOwner ? `/listings/${id}/edit` : undefined}
    />
  );
}
