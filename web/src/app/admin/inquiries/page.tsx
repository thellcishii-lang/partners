'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  INQUIRY_STATUS_LABELS,
  type Inquiry,
  type InquiryStatus,
  type Listing,
  type Advertiser,
} from '@/types';

type AdminAdvertiser = Advertiser & { email?: string };

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [listings, setListings] = useState<Record<string, Listing>>({});
  const [advertisers, setAdvertisers] = useState<Record<string, AdminAdvertiser>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InquiryStatus>('all');
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [inqSnap, listSnap, advSnap] = await Promise.all([
          getDocs(query(collection(db, 'inquiries'), limit(500))),
          getDocs(query(collection(db, 'listings'), limit(500))),
          getDocs(query(collection(db, 'advertisers'), limit(500))),
        ]);
        if (!active) return;

        const items = inqSnap.docs.map((d) => ({ ...d.data(), id: d.id } as Inquiry));
        items.sort((a, b) => {
          const at = a.createdAt?.seconds ?? 0;
          const bt = b.createdAt?.seconds ?? 0;
          return bt - at;
        });

        const lmap: Record<string, Listing> = {};
        listSnap.docs.forEach((d) => {
          lmap[d.id] = { ...d.data(), id: d.id } as Listing;
        });

        const amap: Record<string, AdminAdvertiser> = {};
        advSnap.docs.forEach((d) => {
          amap[d.id] = { ...d.data(), uid: d.id } as AdminAdvertiser;
        });

        setInquiries(items);
        setListings(lmap);
        setAdvertisers(amap);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : '取得に失敗しました。');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const kw = keyword.toLowerCase().trim();
    return inquiries.filter((inq) => {
      if (statusFilter !== 'all' && inq.status !== statusFilter) return false;
      if (!kw) return true;
      const listing = listings[inq.listingId];
      const adv = advertisers[inq.advertiserId];
      const haystack = [
        listing?.title ?? '',
        adv?.companyName ?? '',
        inq.maskedPreview?.prefecture ?? '',
        inq.maskedPreview?.ageRange ?? '',
      ].join(' ').toLowerCase();
      return haystack.includes(kw);
    });
  }, [inquiries, statusFilter, keyword, listings, advertisers]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: inquiries.length };
    inquiries.forEach((i) => {
      c[i.status] = (c[i.status] ?? 0) + 1;
    });
    return c;
  }, [inquiries]);

  if (loading) return <p className="text-sm text-gray-500">読み込み中…</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-bold">応募 {filtered.length}件</h2>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="案件名・会社名・都道府県で検索"
          className="h-9 w-full max-w-xs rounded-lg border border-gray-300 px-3 text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-2 border-b">
        {([
          ['all', `すべて (${counts.all ?? 0})`],
          ['pending', `未開示 (${counts.pending ?? 0})`],
          ['delivered', `開示済み (${counts.delivered ?? 0})`],
          ['won', `採用 (${counts.won ?? 0})`],
          ['lost', `不採用 (${counts.lost ?? 0})`],
          ['cancelled', `辞退 (${counts.cancelled ?? 0})`],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setStatusFilter(key)}
            className={
              'px-3 py-2 text-sm border-b-2 -mb-px ' +
              (statusFilter === key
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700')
            }
          >
            {label}
          </button>
        ))}
      </div>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      {filtered.length === 0 && (
        <p className="rounded-xl bg-white p-6 text-sm text-gray-600 shadow-sm">
          該当する応募はありません。
        </p>
      )}

      <div className="space-y-2">
        {filtered.map((inq) => {
          const listing = listings[inq.listingId];
          const adv = advertisers[inq.advertiserId];
          const statusLabel = INQUIRY_STATUS_LABELS[inq.status];
          const statusColor =
            inq.status === 'pending' ? 'bg-yellow-100 text-yellow-800'
              : inq.status === 'delivered' ? 'bg-emerald-100 text-emerald-800'
                : inq.status === 'won' ? 'bg-emerald-600 text-white'
                  : inq.status === 'lost' ? 'bg-gray-200 text-gray-700'
                    : 'bg-gray-100 text-gray-600';

          return (
            <Link
              key={inq.id}
              href={`/admin/inquiries/${inq.id}`}
              className="block rounded-xl bg-white p-4 shadow-sm transition hover:ring-2 hover:ring-emerald-400"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">
                    {listing?.title ?? '（案件不明）'}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {adv?.companyName ?? '（掲載主不明）'}
                  </p>
                </div>
                <span className={'shrink-0 rounded-full px-3 py-1 text-xs ' + statusColor}>
                  {statusLabel}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-500">
                <span>
                  {inq.createdAt?.seconds
                    ? new Date(inq.createdAt.seconds * 1000).toLocaleString('ja-JP')
                    : ''}
                </span>
                {inq.maskedPreview?.prefecture && <span>📍 {inq.maskedPreview.prefecture}</span>}
                {inq.maskedPreview?.ageRange && <span>{inq.maskedPreview.ageRange}</span>}
                {inq.maskedPreview?.budget && <span>{inq.maskedPreview.budget}</span>}
                <span>経験 {inq.maskedPreview?.hasExperience ? 'あり' : 'なし'}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
