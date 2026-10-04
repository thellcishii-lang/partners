'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function DepositCompletePage() {
  return <Suspense fallback={<p>読み込み中…</p>}><DepositStatus /></Suspense>;
}

function DepositStatus() {
  const { user, loading } = useRequireAuth();
  const orderId = useSearchParams().get('orderId');
  const [order, setOrder] = useState<{ status: string; credits: number } | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setOrder(null);
    setError('');
    if (!user) return;
    if (!orderId || !/^[a-zA-Z0-9]{20}$/.test(orderId)) {
      setError('注文IDが正しくありません。');
      return;
    }
    const stopOrder = onSnapshot(doc(db, 'depositOrders', orderId), (snap) => {
      if (!snap.exists()) {
        setError('注文が見つかりません。');
        return;
      }
      setOrder({ status: snap.get('status'), credits: snap.get('credits') });
    }, (error) => setError(error.message));
    const stopAdv = onSnapshot(doc(db, 'advertisers', user.uid),
      (snap) => setBalance(snap.get('depositBalance') ?? 0), () => {});
    return () => { stopOrder(); stopAdv(); };
  }, [user, orderId]);

  if (loading || !user) return <p>読み込み中…</p>;
  const paid = order?.status === 'paid';
  return (
    <div className="mx-auto max-w-xl space-y-5 rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold">
        {error ? '決済状況を確認できません' : paid ? 'デポジットを追加しました' : '決済を確認しています…'}
      </h1>
      {error && <p role="alert" className="text-red-600">{error}</p>}
      {order && !paid && ['canceled', 'failed'].includes(order.status) && (
        <p role="alert" className="text-red-600">この決済は完了していません。もう一度お試しください。</p>
      )}
      {order && !paid && order.status === 'pending' && (
        <p className="text-sm text-gray-600">決済サービスからの確認を待っています。通常は数秒で反映されます。</p>
      )}
      {paid && (
        <p>{order.credits}件分を追加しました。保留中の応募があれば、古い順に自動で開示されます。</p>
      )}
      {balance !== null && <p className="text-sm text-gray-700">現在の残高：<strong>{balance}件</strong></p>}
      <Link href="/dashboard" className="text-brand-700 underline">マイページへ戻る</Link>
    </div>
  );
}
