'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function PromotionCompletePage() {
  return <Suspense fallback={<p>読み込み中…</p>}><Content /></Suspense>;
}

function Content() {
  const { user, loading } = useRequireAuth();
  const promotionId = useSearchParams().get('promotionId');
  const [promotion, setPromotion] = useState<{
    status: string;
    plan: string;
    startAt?: string;
    endAt?: string;
  } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setPromotion(null);
    setError('');
    if (!user) return;
    if (!promotionId || !/^[a-zA-Z0-9]{20}$/.test(promotionId)) {
      setError('契約IDが正しくありません。');
      return;
    }
    const stop = onSnapshot(doc(db, 'listingPromotions', promotionId), (snap) => {
      if (!snap.exists()) {
        setError('契約が見つかりません。');
        return;
      }
      const start = snap.get('startAt')?.toDate?.();
      const end = snap.get('endAt')?.toDate?.();
      setPromotion({
        status: snap.get('status'),
        plan: snap.get('plan'),
        startAt: start?.toLocaleDateString('ja-JP'),
        endAt: end?.toLocaleDateString('ja-JP'),
      });
    }, (e) => setError(e.message));
    return () => stop();
  }, [user, promotionId]);

  if (loading || !user) return <p className="p-4">読み込み中…</p>;

  const active = promotion?.status === 'active';
  const planLabel = promotion?.plan === 'top' ? '上部表示' : 'おすすめ表示';

  return (
    <div className="mx-auto max-w-xl space-y-5 rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold">
        {error ? '契約状況を確認できません'
          : active ? 'お申し込みありがとうございました'
          : '決済を確認しています…'}
      </h1>
      {error && <p role="alert" className="text-red-600">{error}</p>}
      {promotion && !active && ['canceled', 'failed'].includes(promotion.status) && (
        <p role="alert" className="text-red-600">
          この決済は完了していません。もう一度お試しください。
        </p>
      )}
      {promotion && !active && promotion.status === 'pending' && (
        <p className="text-sm text-gray-600">
          決済サービスからの確認を待っています。通常は数秒で反映されます。
        </p>
      )}
      {active && (
        <>
          <p className="text-sm text-gray-700">
            {planLabel}のお申し込みが完了しました。期間中、案件が優先表示されます。
          </p>
          <div className="rounded-lg bg-gray-50 p-4 text-sm">
            <p>開始日：{promotion?.startAt ?? '—'}</p>
            <p>終了日：{promotion?.endAt ?? '（サブスクのため自動更新）'}</p>
          </div>
        </>
      )}
      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/promotions" className="text-brand-700 underline">
          契約一覧へ
        </Link>
        <Link href="/dashboard" className="text-brand-700 underline">
          マイページへ
        </Link>
      </div>
    </div>
  );
}
