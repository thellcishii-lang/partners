'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import {
  INQUIRY_STATUS_LABELS,
  type Inquiry,
  type InquiryDetail,
  type Listing,
} from '@/types';

type InquiryRow = {
  inquiry: Inquiry;
  detail: InquiryDetail | null;
};

export default function ListingInquiriesPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useRequireAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [rows, setRows] = useState<InquiryRow[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !id) return;
    let active = true;
    setDataLoading(true);
    setError('');

    (async () => {
      const listingSnap = await getDoc(doc(db, 'listings', id));
      if (!listingSnap.exists()) {
        if (active) {
          setError('案件が見つかりません。');
          setDataLoading(false);
        }
        return;
      }
      const listingData = { ...listingSnap.data(), id: listingSnap.id } as Listing;
      if (listingData.advertiserId !== user.uid) {
        if (active) {
          setError('この案件の応募者一覧は閲覧できません。');
          setDataLoading(false);
        }
        return;
      }
      if (active) setListing(listingData);

      const inqSnap = await getDocs(
  query(
    collection(db, 'inquiries'),
    where('listingId', '==', id),
    where('advertiserId', '==', user.uid)
  )
);
      const inquiries = inqSnap.docs.map((d) => ({ ...d.data(), id: d.id } as Inquiry));
      inquiries.sort((a, b) => {
        const at = a.createdAt?.seconds ?? 0;
        const bt = b.createdAt?.seconds ?? 0;
        return bt - at;
      });

      const detailPairs = await Promise.all(
        inquiries.map(async (inq) => {
          try {
            const s = await getDoc(doc(db, 'inquiryDetails', inq.id));
            return {
              inquiry: inq,
              detail: s.exists()
                ? ({ ...s.data(), inquiryId: s.id } as InquiryDetail)
                : null,
            };
          } catch {
            return { inquiry: inq, detail: null };
          }
        })
      );

      if (active) {
        setRows(detailPairs);
        setDataLoading(false);
      }
    })().catch((e) => {
      if (active) {
        setError(e instanceof Error ? e.message : '取得に失敗しました。');
        setDataLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [user, id]);

  if (loading || !user || dataLoading) {
    return <p className="text-center text-sm text-gray-500">読み込み中…</p>;
  }
  if (error) {
    return <p role="alert" className="text-center text-sm text-red-600">{error}</p>;
  }
  if (!listing) return null;

  return (
    <div className="space-y-5">
      <div>
        <Link href="/dashboard" className="text-xs text-gray-500 hover:underline">
          ← マイページ
        </Link>
        <h1 className="mt-1 text-xl font-bold">応募者一覧</h1>
        <p className="mt-1 text-sm text-gray-600">{listing.title}</p>
      </div>

      {rows.length === 0 && (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-gray-600">まだ応募はありません。</p>
        </div>
      )}

      <div className="space-y-3">
        {rows.map(({ inquiry, detail }) => {
          const statusLabel = INQUIRY_STATUS_LABELS[inquiry.status];
          const statusColor =
            inquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-800'
              : inquiry.status === 'delivered' ? 'bg-emerald-100 text-emerald-800'
                : inquiry.status === 'won' ? 'bg-emerald-600 text-white'
                  : inquiry.status === 'lost' ? 'bg-gray-200 text-gray-700'
                    : 'bg-gray-100 text-gray-600';

          const disclosed = inquiry.status !== 'pending';

          return (
            <div key={inquiry.id} className="rounded-xl bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {disclosed && detail ? (
                    <>
                      <p className="font-bold">{detail.fullName || '（氏名なし）'}</p>
                      <div className="mt-1 space-y-0.5 text-xs text-gray-600">
                        {detail.phone && <p>電話：{detail.phone}</p>}
                        {detail.email && <p>メール：{detail.email}</p>}
                      </div>
                    </>
                  ) : (
                    <p className="font-bold text-gray-400">（未開示）</p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className={'rounded-full px-3 py-1 ' + statusColor}>
                      {statusLabel}
                    </span>
                    {inquiry.createdAt?.seconds && (
                      <span className="text-gray-500">
                        {new Date(inquiry.createdAt.seconds * 1000).toLocaleString('ja-JP')}
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  href={`/dashboard/listings/${id}/inquiries/${inquiry.id}`}
                  className="shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                >
                  詳細を見る
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
