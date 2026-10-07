'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminHomePage() {
  const [stats, setStats] = useState({
    published: 0,
    reviewing: 0,
    editReviewing: 0,
    advertisers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [pub, rev, editRev, adv] = await Promise.all([
          getCountFromServer(query(collection(db, 'listings'), where('status', '==', 'published'))),
          getCountFromServer(query(collection(db, 'listings'), where('status', '==', 'reviewing'))),
          getCountFromServer(query(
            collection(db, 'listings'),
            where('status', '==', 'published'),
            where('pendingEditSubmitted', '==', true),
          )),
          getCountFromServer(collection(db, 'advertisers')),
        ]);
        if (!active) return;
        setStats({
          published: pub.data().count,
          reviewing: rev.data().count,
          editReviewing: editRev.data().count,
          advertisers: adv.data().count,
        });
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : '集計に失敗しました。');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  if (loading) return <p className="text-sm text-gray-500">読み込み中…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="公開中" value={stats.published} href="/listings" />
        <Stat label="新規審査待ち" value={stats.reviewing} href="/admin/listings" highlight={stats.reviewing > 0} />
        <Stat label="編集審査待ち" value={stats.editReviewing} href="/admin/listings" highlight={stats.editReviewing > 0} />
        <Stat label="掲載主" value={stats.advertisers} href="/admin/advertisers" />
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-bold">ショートカット</h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/listings"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
          >
            案件審査
          </Link>
          <Link
            href="/admin/advertisers"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
          >
            掲載主一覧
          </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  href,
  highlight,
}: {
  label: string;
  value: number;
  href: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        'block rounded-2xl bg-white p-5 shadow-sm transition hover:ring-2 hover:ring-emerald-400 ' +
        (highlight ? 'ring-2 ring-orange-300' : '')
      }
    >
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </Link>
  );
}
