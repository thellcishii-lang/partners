'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type DepositTx = {
  id: string;
  type: 'purchase' | 'consume' | 'refund';
  amount: number;
  balanceAfter: number;
  reason: string;
  orderId?: string | null;
  inquiryId?: string | null;
  operatorId?: string | null;
  note?: string | null;
  createdAt?: { seconds: number; nanoseconds: number } | null;
};

const TYPE_LABELS: Record<string, string> = {
  purchase: '購入',
  consume: '消費',
  refund: '返金',
};

const TYPE_COLORS: Record<string, string> = {
  purchase: 'bg-emerald-100 text-emerald-800',
  consume: 'bg-gray-100 text-gray-700',
  refund: 'bg-orange-100 text-orange-800',
};

export default function AdminAdvertiserDepositsPage() {
  const { uid } = useParams<{ uid: string }>();
  const [transactions, setTransactions] = useState<DepositTx[]>([]);
  const [companyName, setCompanyName] = useState('');
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!uid) return;
    let active = true;
    (async () => {
      try {
        const [advSnap, txSnap] = await Promise.all([
          getDoc(doc(db, 'advertisers', uid)),
          getDocs(query(collection(db, 'depositTransactions'), where('advertiserId', '==', uid))),
        ]);
        if (!active) return;
        setCompanyName(advSnap.data()?.companyName ?? '（会社名未設定）');
        const items = txSnap.docs.map((d) => ({ ...d.data(), id: d.id } as DepositTx));
        items.sort((a, b) => {
          const at = a.createdAt?.seconds ?? 0;
          const bt = b.createdAt?.seconds ?? 0;
          return bt - at;
        });
        setTransactions(items);
        setBalance(items[0]?.balanceAfter ?? 0);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : '取得に失敗しました。');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [uid]);

  if (loading) return <p className="text-sm text-gray-500">読み込み中…</p>;
  if (error) return <p role="alert" className="text-sm text-red-600">{error}</p>;

  const totalPurchased = transactions
    .filter((t) => t.type === 'purchase')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalConsumed = transactions
    .filter((t) => t.type === 'consume')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <div className="space-y-5">
      <div>
        <Link href={`/admin/advertisers/${uid}`} className="text-xs text-gray-500 hover:underline">
          ← {companyName}
        </Link>
        <h2 className="mt-1 text-lg font-bold">デポジット履歴</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card label="現在の残高" value={`${balance ?? 0}件`} />
        <Card label="累計購入" value={`${totalPurchased}件`} />
        <Card label="累計消費" value={`${totalConsumed}件`} />
      </div>

      {transactions.length === 0 && (
        <p className="rounded-xl bg-white p-6 text-sm text-gray-600 shadow-sm">
          取引履歴がありません。
        </p>
      )}

      {transactions.length > 0 && (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs text-gray-500">
                <th className="px-4 py-3 font-medium">日時</th>
                <th className="px-4 py-3 font-medium">種別</th>
                <th className="px-4 py-3 text-right font-medium">増減</th>
                <th className="px-4 py-3 text-right font-medium">残高</th>
                <th className="px-4 py-3 font-medium">内容</th>
                <th className="px-4 py-3 font-medium">参照ID</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                    {tx.createdAt?.seconds
                      ? new Date(tx.createdAt.seconds * 1000).toLocaleString('ja-JP')
                      : ''}
                  </td>
                  <td className="px-4 py-3">
                    <span className={'rounded-full px-3 py-1 text-xs ' + (TYPE_COLORS[tx.type] ?? 'bg-gray-100')}>
                      {TYPE_LABELS[tx.type] ?? tx.type}
                    </span>
                  </td>
                  <td className={
                    'px-4 py-3 text-right font-bold ' +
                    (tx.amount > 0 ? 'text-emerald-700' : 'text-gray-700')
                  }>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">{tx.balanceAfter}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {tx.reason}
                    {tx.note && <span className="ml-1 text-gray-400">（{tx.note}）</span>}
                  </td>
                  <td className="px-4 py-3 text-[11px] text-gray-400">
                    {tx.orderId && <div>order: {tx.orderId.slice(0, 10)}…</div>}
                    {tx.inquiryId && <div>inquiry: {tx.inquiryId.slice(0, 10)}…</div>}
                    {tx.operatorId && <div>op: {tx.operatorId.slice(0, 10)}…</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}
