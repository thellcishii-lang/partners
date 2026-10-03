'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Listing } from '@/types';

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getDocs(query(collection(db, 'listings'), where('status', '==', 'published'))).then((snap) => {
      if (active) setListings(snap.docs.map((item) => ({ ...item.data(), id: item.id } as Listing)));
    }).catch((error: unknown) => {
      if (active) setError(error instanceof Error ? error.message : '案件一覧の取得に失敗しました。');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">公開案件一覧</h1>
      {loading && <p>読み込み中…</p>}
      {error && <p role="alert" className="text-red-600">{error}</p>}
      {!loading && !error && listings.length === 0 && <p className="text-gray-600">公開中の案件はありません。</p>}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <Link key={listing.id} href={`/listings/${listing.id}`}
            className="space-y-3 rounded-2xl bg-white p-6 shadow-sm hover:ring-2 hover:ring-brand-500">
            <p className="text-sm text-brand-700">{listing.category}</p>
            <h2 className="text-lg font-bold">{listing.title}</h2>
            <p className="text-sm text-gray-600">会社名：{listing.companyName || '未設定'}</p>
            <p className="text-sm">エリア：{listing.area || '応相談'}</p>
            <p className="whitespace-pre-wrap text-sm">報酬：{listing.reward || '応相談'}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
