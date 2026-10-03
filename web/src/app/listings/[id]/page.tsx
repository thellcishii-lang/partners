'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useListing } from '@/hooks/useListing';
import { useAuth } from '@/providers/AuthProvider';
import { LISTING_STATUS_LABELS } from '@/types';

export default function ListingPage() {
  const { id } = useParams<{ id: string }>();
  const { listing, loading, error } = useListing(id);
  const { user } = useAuth();
  if (loading) return <p>読み込み中…</p>;
  if (error || !listing) return <p role="alert" className="text-red-600">{error}</p>;
  return (
    <article className="mx-auto max-w-3xl space-y-6 rounded-2xl bg-white p-6 shadow-sm">
      <p className="text-sm text-brand-700">{listing.category} · {LISTING_STATUS_LABELS[listing.status]}</p>
      <h1 className="text-2xl font-bold">{listing.title}</h1>
      <p className="text-gray-600">{listing.companyName}</p>
      {([
        ['description', '募集内容'],
        ['requirements', '応募条件'],
        ['reward', '報酬体系'],
        ['initialCost', '初期費用'],
        ['royalty', 'ロイヤリティ'],
        ['area', '募集エリア'],
      ] as const).map(([key, label]) => (
        <section key={key}>
          <h2 className="font-bold">{label}</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm">{listing[key] || '未設定'}</p>
        </section>
      ))}
      {listing.status === 'published' ? (
        <Link href={`/listings/${id}/apply`} className="inline-flex rounded-lg bg-brand-600 px-6 py-3 font-medium text-white">
          応募する
        </Link>
      ) : <p className="text-gray-600">現在この案件への応募は受け付けていません。</p>}
      {user?.uid === listing.advertiserId && (
        <Link href={`/listings/${id}/edit`} className="ml-4 text-brand-700 underline">案件を編集</Link>
      )}
    </article>
  );
}
