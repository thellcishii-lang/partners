'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { doc, getDoc, getDocs, query, collection, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import { PreviewModal } from '@/components/listings/PreviewModal';
import { LISTING_STATUS_LABELS, type Advertiser, type Listing } from '@/types';

type AdminAdvertiser = Advertiser & { email?: string };

export default function AdminAdvertiserDetailPage() {
  const { uid } = useParams<{ uid: string }>();
  const [advertiser, setAdvertiser] = useState<AdminAdvertiser | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewListing, setPreviewListing] = useState<Listing | null>(null);

  useEffect(() => {
    if (!uid) return;
    let active = true;
    (async () => {
      try {
        const [advSnap, listSnap] = await Promise.all([
          getDoc(doc(db, 'advertisers', uid)),
          getDocs(query(collection(db, 'listings'), where('advertiserId', '==', uid))),
        ]);
        if (!active) return;
        if (!advSnap.exists()) {
          setError('掲載主が見つかりません。');
          return;
        }
        setAdvertiser({ ...advSnap.data(), uid: advSnap.id } as AdminAdvertiser);
        const items = listSnap.docs.map((d) => ({ ...d.data(), id: d.id } as Listing));
        items.sort((a, b) => {
          const at = (a.updatedAt as { seconds?: number } | null)?.seconds ?? 0;
          const bt = (b.updatedAt as { seconds?: number } | null)?.seconds ?? 0;
          return bt - at;
        });
        setListings(items);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : '取得に失敗しました。');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [uid]);

  if (loading) return <p className="text-sm text-gray-500">読み込み中…</p>;
  if (error) return <p role="alert" className="text-sm text-red-600">{error}</p>;
  if (!advertiser) return null;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/advertisers" className="text-xs text-gray-500 hover:underline">
          ← 掲載主一覧
        </Link>
        <h2 className="mt-2 text-lg font-bold">
          {advertiser.companyName || '（会社名未設定）'}
        </h2>
        <p className="text-xs text-gray-500">{advertiser.email}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="残高" value={advertiser.depositBalance ?? 0} unit="件" />
        <Stat label="保留" value={advertiser.pendingCount ?? 0} unit="件" />
        <Stat label="案件数" value={listings.length} unit="件" />
      </div>

      <section className="space-y-3">
        <h3 className="text-base font-bold">案件一覧</h3>
        {listings.length === 0 && (
          <p className="rounded-xl bg-white p-6 text-sm text-gray-600 shadow-sm">
            案件がありません。
          </p>
        )}
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-5 shadow-sm"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{listing.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-gray-100 px-3 py-1">
                  {LISTING_STATUS_LABELS[listing.status]}
                </span>
                {listing.pendingEditSubmitted && (
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-orange-800">
                    編集審査中
                  </span>
                )}
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPreviewListing(listing)}
              >
                プレビュー
              </Button>
              <Link href={`/listings/${listing.id}/edit`}>
                <Button size="sm" variant="outline">代理編集</Button>
              </Link>
            </div>
          </div>
        ))}
      </section>

      {previewListing && (
        <PreviewModal
          listing={previewListing}
          onClose={() => setPreviewListing(null)}
        />
      )}
    </div>
  );
}

function Stat({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold">
        {value}
        <span className="ml-1 text-sm font-normal text-gray-500">{unit}</span>
      </p>
    </div>
  );
}
