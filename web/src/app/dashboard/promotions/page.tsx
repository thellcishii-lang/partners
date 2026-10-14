'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/lib/firebase';
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
  const [busy, setBusy] = useState('');

  const load = async () => {
    if (!user) return;
    const snap = await getDocs(
      query(collection(db, 'listingPromotions'), where('advertiserId', '==', user.uid))
    );
    const items = snap.docs.map((d) => ({ ...d.data(), id: d.id } as ListingPromotion));
    items.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
    setRows(items);
  };

  useEffect(() => {
    if (!user) return;
    let active = true;
    setDataLoading(true);
    load()
      .catch((e) => { if (active) setError(e instanceof Error ? e.message : '取得に失敗しました。'); })
      .finally(() => { if (active) setDataLoading(false); });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const cancel = async (promotionId: string) => {
    if (!window.confirm(
      'このサブスクリプションを解約しますか？\n\n現在の期間の終了日までは有効です。以降は自動更新されません。'
    )) return;
    setBusy(promotionId);
    setError('');
    try {
      const fn = httpsCallable<{ promotionId: string }, { canceled: boolean }>(
        functions, 'cancelPromotion'
      );
      await fn({ promotionId });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : '解約に失敗しました。');
    } finally {
      setBusy('');
    }
  };

  if (loading || !user || dataLoading) {
    return <p className="p-4 text-sm text-gray-500">読み込み中…</p>;
  }

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

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

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
          const isSubscription = r.billingType === 'subscription';
          const isCanceled = !!(r as unknown as { canceledAt?: unknown }).canceledAt;
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
                    {isSubscription && (
                      <span className="ml-2 text-xs text-gray-500">（月額サブスク）</span>
                    )}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    <span className={'rounded-full px-3 py-1 ' + statusColor}>
                      {PROMOTION_STATUS_LABELS[r.status]}
                    </span>
                    {isCanceled && isActive && (
                      <span className="rounded-full bg-orange-100 px-3 py-1 text-orange-800">
                        期間終了後に解約
                      </span>
                    )}
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
                {isActive && isSubscription && !isCanceled && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy === r.id}
                    onClick={() => cancel(r.id)}
                  >
                    解約する
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
