'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  PROMOTION_PLAN_LABELS,
  PROMOTION_STATUS_LABELS,
  type ListingPromotion,
} from '@/types';

export default function AdminPromotionsPage() {
  const [rows, setRows] = useState<ListingPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'active' | 'expired' | 'all'>('active');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const snap = await getDocs(
        query(collection(db, 'listingPromotions'), orderBy('createdAt', 'desc'), limit(200))
      );
      setRows(snap.docs.map((d) => ({ ...d.data(), id: d.id } as ListingPromotion)));
    } catch (e) {
      setError(e instanceof Error ? e.message : '取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === 'all'
    ? rows
    : filter === 'active'
      ? rows.filter((r) => r.status === 'active' || r.status === 'pending')
      : rows.filter((r) => r.status === 'expired' || r.status === 'canceled');

  const topCount = rows.filter((r) => r.plan === 'top' && (r.status === 'active' || r.status === 'pending')).length;
  const recommendCount = rows.filter((r) => r.plan === 'recommend' && (r.status === 'active' || r.status === 'pending')).length;

  if (loading) return <p className="text-sm text-gray-500">読み込み中…</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold">おすすめ表示の契約</h2>
        <button
          type="button"
          onClick={load}
          className="text-sm text-brand-700 underline hover:no-underline"
        >
          再読み込み
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">上部表示</p>
          <p className="mt-1 text-2xl font-bold">
            {topCount} <span className="text-sm font-normal text-gray-500">/ 5 枠</span>
          </p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">おすすめ表示</p>
          <p className="mt-1 text-2xl font-bold">
            {recommendCount} <span className="text-sm font-normal text-gray-500">/ 10 枠</span>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b">
        {([
          ['active', '契約中'],
          ['expired', '終了'],
          ['all', 'すべて'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={
              'px-3 py-2 text-sm border-b-2 -mb-px ' +
              (filter === key
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
          該当する契約はありません。
        </p>
      )}

      <div className="space-y-3">
        {filtered.map((r) => {
          const statusColor =
            r.status === 'active' ? 'bg-emerald-100 text-emerald-800'
              : r.status === 'pending' ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-600';
          return (
            <div key={r.id} className="rounded-xl bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-bold">
                    {PROMOTION_PLAN_LABELS[r.plan]}
                    {r.billingType === 'subscription' && (
                      <span className="ml-2 text-xs text-gray-500">（月額サブスク）</span>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    契約ID：{r.id.slice(0, 12)}…
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    <span className={'rounded-full px-3 py-1 ' + statusColor}>
                      {PROMOTION_STATUS_LABELS[r.status]}
                    </span>
                    <span className="text-gray-500">
                      {r.totalJpy.toLocaleString('ja-JP')}円（税込）
                    </span>
                  </div>
                  {r.startAt?.seconds && (
                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(r.startAt.seconds * 1000).toLocaleDateString('ja-JP')}
                      {r.endAt?.seconds && ` 〜 ${new Date(r.endAt.seconds * 1000).toLocaleDateString('ja-JP')}`}
                    </p>
                  )}
                </div>
                <Link
                  href={`/admin/advertisers/${r.advertiserId}`}
                  className="shrink-0 text-xs text-brand-700 underline"
                >
                  掲載主を見る →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
