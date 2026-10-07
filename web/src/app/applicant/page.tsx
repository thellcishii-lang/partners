'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/Button';
import {
  INQUIRY_STATUS_LABELS,
  type Inquiry,
  type Listing,
} from '@/types';

export default function ApplicantDashboardPage() {
  const { user, loading } = useRequireAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [listings, setListings] = useState<Record<string, Listing | null>>({});
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    let active = true;
    setDataLoading(true);
    setError('');
    (async () => {
      const snap = await getDocs(
        query(collection(db, 'inquiries'), where('applicantId', '==', user.uid))
      );
      const items = snap.docs.map((d) => ({ ...d.data(), id: d.id } as Inquiry));
      items.sort((a, b) => {
        const at = a.createdAt?.seconds ?? 0;
        const bt = b.createdAt?.seconds ?? 0;
        return bt - at;
      });

      // 各 listingId のタイトルを取得
      const map: Record<string, Listing | null> = {};
      const ids = Array.from(new Set(items.map((i) => i.listingId).filter(Boolean)));
      await Promise.all(
        ids.map(async (lid) => {
          try {
            const s = await getDoc(doc(db, 'listings', lid));
            map[lid] = s.exists() ? ({ ...s.data(), id: s.id } as Listing) : null;
          } catch {
            map[lid] = null;
          }
        })
      );

      if (!active) return;
      setInquiries(items);
      setListings(map);
    })().catch((e) => {
      if (active) setError(e instanceof Error ? e.message : '取得に失敗しました。');
    }).finally(() => {
      if (active) setDataLoading(false);
    });
    return () => { active = false; };
  }, [user]);

  if (loading || !user || dataLoading) {
    return <p className="text-center text-sm text-gray-500">読み込み中…</p>;
  }
  if (error) return <p role="alert" className="text-sm text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">応募履歴</h1>
        <Link href="/listings">
          <Button variant="outline">案件を探す</Button>
        </Link>
      </div>

      {inquiries.length === 0 && (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-gray-600">まだ応募した案件はありません。</p>
          <p className="mt-2 text-sm text-gray-500">
            気になる案件に資料請求してみましょう。
          </p>
          <Link href="/listings">
            <Button className="mt-4">案件を探す</Button>
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {inquiries.map((inq) => {
          const listing = listings[inq.listingId];
          const statusLabel = INQUIRY_STATUS_LABELS[inq.status];
          const statusColor =
            inq.status === 'pending' ? 'bg-yellow-100 text-yellow-800'
              : inq.status === 'delivered' ? 'bg-emerald-100 text-emerald-800'
                : inq.status === 'won' ? 'bg-emerald-600 text-white'
                  : inq.status === 'lost' ? 'bg-gray-200 text-gray-700'
                    : 'bg-gray-100 text-gray-600';

          return (
            <div key={inq.id} className="rounded-xl bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {listing ? (
                    <Link
                      href={`/listings/${listing.id}`}
                      className="font-bold text-brand-700 hover:underline"
                    >
                      {listing.title}
                    </Link>
                  ) : (
                    <p className="font-bold text-gray-400">（募集終了）</p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className={'rounded-full px-3 py-1 ' + statusColor}>
                      {statusLabel}
                    </span>
                    {inq.createdAt?.seconds && (
                      <span className="text-gray-500">
                        {new Date(inq.createdAt.seconds * 1000).toLocaleDateString('ja-JP')}
                      </span>
                    )}
                  </div>
                  {inq.maskedPreview && (
                    <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                      {inq.maskedPreview.prefecture && (
                        <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-600">
                          {inq.maskedPreview.prefecture}
                        </span>
                      )}
                      {inq.maskedPreview.ageRange && (
                        <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-600">
                          {inq.maskedPreview.ageRange}
                        </span>
                      )}
                      {inq.maskedPreview.budget && (
                        <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-600">
                          {inq.maskedPreview.budget}
                        </span>
                      )}
                      <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-600">
                        経験 {inq.maskedPreview.hasExperience ? 'あり' : 'なし'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
