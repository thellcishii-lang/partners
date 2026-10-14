'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/Button';
import {
  PROMOTION_PLAN_LABELS,
  PROMOTION_STATUS_LABELS,
  type ListingPromotion,
} from '@/types';

export default function DashboardPromotionsPage() {
  const { user, loading } = useRequireAuth();
  const [rows, setRows] = useState<ListingPromotion[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    let active = true;
    setDataLoading(true);
    (async () => {
      const snap = await getDocs(
        query(collection(db, 'listingPromotions'), where('advertiserId', '==', user.uid))
      );
      const items = snap.docs.map((d) => ({ ...d.data(), id: d.id } as ListingPromotion));
      items.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      if (active) setRows(items);
    })()
      .catch((e) => { if (active) setError(e instanceof Error ? e.message : '取得に失敗しました。'); })
      .finally(() => { if (active) setDataLoading(false); });
    return () => { active = false; };
  }, [user]);

  if (loading || !user || dataLoading) {
    return <p className="p-4 text-sm text-gray-500">読み込み中…</p>;
  }
  if (error) return <p role="alert" className="p-4 text-sm text-red-600">{error}</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-xs text-gray-500 hover:underline">
            ← マイページ
          </Link>
          <h1 className="mt-1 text-xl font-bold">おすすめ表示の契約</h1>
        </div>
        <Link href="/promotions">
          <Button>新規申し込み</Button>
        </Link>
      </div>

      {rows.length === 0 && (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-gray-600">まだ契約はありません。</p>
          <Link href="/promotions" className="mt-3 inline-block text-sm text-brand-700 underline">
            プランを見る
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {rows.map((r) => {
          const isActive = r.status === 'active';
          const statusColor =
            r.status === 'active' ? 'bg-emerald-100 text-emerald-800'
              : r.status === 'pending' ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-600';

          return (
            <div key={r.id} className="rounded-xl bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-bold">
                    {PROMOTION_PLAN_LABELS[r.plan]}
                    {r.billingType === 'subscription' && (
                      <span className="ml-2 text-xs text-gray-500">（月額サブスク）</span>
                    )}
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
                    <p className="mt-2 text-xs text-gray-500">
                      開始日：{new Date(r.startAt.seconds * 1000).toLocaleDateString('ja-JP')}
                      {r.endAt?.seconds && (
                        <> ／ 終了日：{new Date(r.endAt.seconds * 1000).toLocaleDateString('ja-JP')}</>
                      )}
                    </p>
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
