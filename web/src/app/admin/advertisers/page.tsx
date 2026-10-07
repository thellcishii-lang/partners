'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  collection, getDocs, limit, query, getCountFromServer, where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Advertiser } from '@/types';

export default function AdminAdvertisersPage() {
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [listingsCount, setListingsCount] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // get() を含む list ルールでは limit() が必須
        const snap = await getDocs(query(collection(db, 'advertisers'), limit(200)));
        if (!active) return;
        const items = snap.docs.map((d) => ({ ...d.data(), uid: d.id } as Advertiser));
        items.sort((a, b) => (a.companyName ?? '').localeCompare(b.companyName ?? '', 'ja'));
        setAdvertisers(items);

        // 各掲載主の案件数を並列取得
        const counts: Record<string, number> = {};
        await Promise.all(
          items.map(async (a) => {
            try {
              const cnt = await getCountFromServer(
                query(collection(db, 'listings'), where('advertiserId', '==', a.uid)),
              );
              counts[a.uid] = cnt.data().count;
            } catch {
              counts[a.uid] = 0;
            }
          }),
        );
        if (active) setListingsCount(counts);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : '取得に失敗しました。');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const filtered = advertisers.filter((a) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      (a.companyName ?? '').toLowerCase().includes(s) ||
      (a.email ?? '').toLowerCase().includes(s)
    );
  });

  if (loading) return <p className="text-sm text-gray-500">読み込み中…</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-bold">掲載主 {filtered.length}件</h2>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="会社名・メールで検索"
          className="h-9 w-full max-w-xs rounded-lg border border-gray-300 px-3 text-sm"
        />
      </div>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      {filtered.length === 0 && (
        <p className="rounded-xl bg-white p-6 text-sm text-gray-600 shadow-sm">
          掲載主が見つかりません。
        </p>
      )}

      <div className="space-y-3">
        {filtered.map((a) => (
          <Link
            key={a.uid}
            href={`/admin/advertisers/${a.uid}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-5 shadow-sm transition hover:ring-2 hover:ring-emerald-400"
          >
            <div className="min-w-0 flex-1">
              <p className="font-bold">{a.companyName || '（会社名未設定）'}</p>
              <p className="mt-1 text-xs text-gray-500">{a.email}</p>
            </div>
            <div className="flex shrink-0 gap-4 text-xs text-gray-700">
              <span>案件 <strong>{listingsCount[a.uid] ?? '—'}</strong></span>
              <span>残高 <strong>{a.depositBalance ?? 0}</strong></span>
              <span>保留 <strong>{a.pendingCount ?? 0}</strong></span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
