'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  collection, getDocs, query, orderBy, limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

type RefundRequest = {
  id: string;
  advertiserId: string;
  amountYen: number;
  feeYen: number;
  netAmountYen: number;
  bankInfo: {
    bankName: string;
    branchName: string;
    accountType: string;
    accountNumber: string;
    accountHolder: string;
  };
  status: 'pending' | 'completed';
  requestedAt?: { seconds: number };
  completedAt?: { seconds: number } | null;
  note?: string | null;
};

export default function AdminRefundsPage() {
  const [rows, setRows] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'pending' | 'completed' | 'all'>('pending');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const snap = await getDocs(
        query(collection(db, 'refundRequests'), orderBy('requestedAt', 'desc'), limit(200))
      );
      setRows(snap.docs.map((d) => ({ ...d.data(), id: d.id } as RefundRequest)));
    } catch (e) {
      setError(e instanceof Error ? e.message : '取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === 'all' ? rows : rows.filter((r) => r.status === filter);

  if (loading) return <p className="text-sm text-gray-500">読み込み中…</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold">返金申請 {filtered.length}件</h2>
        <button
          type="button"
          onClick={load}
          className="text-sm text-brand-700 underline hover:no-underline"
        >
          再読み込み
        </button>
      </div>

      <div className="flex flex-wrap gap-2 border-b">
        {([
          ['pending', '申請中'],
          ['completed', '完了'],
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
          該当する申請はありません。
        </p>
      )}

      <div className="space-y-3">
        {filtered.map((r) => (
          <Link
            key={r.id}
            href={`/admin/refunds/${r.id}`}
            className="block rounded-xl bg-white p-5 shadow-sm transition hover:ring-2 hover:ring-emerald-400"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-bold">
                  実振込額：{r.netAmountYen.toLocaleString('ja-JP')}円
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  返金総額：{r.amountYen.toLocaleString('ja-JP')}円 ／ 手数料：{r.feeYen}円
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {r.bankInfo.bankName} {r.bankInfo.branchName} {r.bankInfo.accountNumber}
                </p>
              </div>
              <span
                className={
                  'shrink-0 rounded-full px-3 py-1 text-xs ' +
                  (r.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-yellow-100 text-yellow-800')
                }
              >
                {r.status === 'completed' ? '完了' : '申請中'}
              </span>
            </div>
            {r.requestedAt?.seconds && (
              <p className="mt-2 text-[11px] text-gray-400">
                申請日：{new Date(r.requestedAt.seconds * 1000).toLocaleString('ja-JP')}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
