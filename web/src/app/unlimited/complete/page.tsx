'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function UnlimitedCompletePage() {
  return <Suspense fallback={<p>読み込み中…</p>}><UnlimitedStatus /></Suspense>;
}

function UnlimitedStatus() {
  const { user, loading } = useRequireAuth();
  const orderId = useSearchParams().get('orderId');
  const [order, setOrder] = useState<{ status: string; startAt?: string; endAt?: string } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setOrder(null);
    setError('');
    if (!user) return;
    if (!orderId || !/^[a-zA-Z0-9]{20}$/.test(orderId)) {
      setError('注文IDが正しくありません。');
      return;
    }
    const stop = onSnapshot(doc(db, 'unlimitedOrders', orderId), (snap) => {
      if (!snap.exists()) {
        setError('注文が見つかりません。');
        return;
      }
      const start = snap.get('startAt')?.toDate?.();
      const end = snap.get('endAt')?.toDate?.();
      setOrder({
        status: snap.get('status'),
        startAt: start?.toLocaleDateString('ja-JP'),
        endAt: end?.toLocaleDateString('ja-JP'),
      });
    }, (e) => setError(e.message));
    return () => stop();
  }, [user, orderId]);

  if (loading || !user) return <p>読み込み中…</p>;
  const paid = order?.status === 'paid';

  return (
    <div className="mx-auto max-w-xl space-y-5 rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold">
        {error ? '決済状況を確認できません'
          : paid ? '無制限プランをお申し込みいただきました'
          : '決済を確認しています…'}
      </h1>
      {error && <p role="alert" className="text-red-600">{error}</p>}
      {order && !paid && ['canceled', 'failed'].includes(order.status) && (
        <p role="alert" className="text-red-600">
          この決済は完了していません。もう一度お試しください。
        </p>
      )}
      {order && !paid && order.status === 'pending' && (
        <p className="text-sm text-gray-600">
          決済サービスからの確認を待っています。通常は数秒で反映されます。
        </p>
      )}
      {paid && (
        <>
          <p className="text-sm text-gray-700">
            期間中は、デポジットを消費せずに応募者の情報を開示できます。
          </p>
          <div className="rounded-lg bg-gray-50 p-4 text-sm">
            <p>開始日：{order?.startAt ?? '—'}</p>
            <p>終了日：{order?.endAt ?? '—'}</p>
          </div>
        </>
      )}
      <Link href="/dashboard" className="text-brand-700 underline">
        マイページへ戻る
      </Link>
    </div>
  );
}
