'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import type { Listing } from '@/types';

export default function AdminListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string>('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const snap = await getDocs(
        query(collection(db, 'listings'), where('status', '==', 'reviewing'))
      );
      const items = snap.docs
        .map((d) => ({ ...d.data(), id: d.id } as Listing))
        .sort((a, b) => {
          const at = (a.updatedAt as { seconds?: number } | null)?.seconds ?? 0;
          const bt = (b.updatedAt as { seconds?: number } | null)?.seconds ?? 0;
          return at - bt; // 古い申請から処理
        });
      setListings(items);
    } catch (e) {
      setError(e instanceof Error ? e.message : '取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const call = async (
    fnName: 'approveListing' | 'rejectListing',
    listingId: string,
    payload: Record<string, unknown> = {}
  ) => {
    setBusy(listingId);
    setError('');
    try {
      const callable = httpsCallable<Record<string, unknown>, { listingId: string }>(
        functions,
        fnName
      );
      await callable({ listingId, ...payload });
      setListings((prev) => prev.filter((l) => l.id !== listingId));
    } catch (e) {
      setError(e instanceof Error ? e.message : '処理に失敗しました。');
    } finally {
      setBusy('');
    }
  };

  const approve = (id: string) => call('approveListing', id);

  const reject = (id: string) => {
    const reason = window.prompt('却下理由（任意・募集者にメールで通知されます）') ?? '';
    if (!window.confirm('この案件を却下して下書きに戻しますか？')) return;
    call('rejectListing', id, { reason });
  };

  if (loading) return <p className="text-sm text-gray-500">読み込み中…</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold">審査待ち {listings.length}件</h2>
        <button
          type="button"
          onClick={load}
          className="text-sm text-brand-700 underline hover:no-underline"
        >
          再読み込み
        </button>
      </div>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      {listings.length === 0 && (
        <p className="rounded-xl bg-white p-6 text-sm text-gray-600 shadow-sm">
          審査待ちの案件はありません。
        </p>
      )}

      <div className="space-y-3">
        {listings.map((l) => (
          <div key={l.id} className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <Link
                  href={`/listings/${l.id}`}
                  className="font-bold text-brand-700 hover:underline"
                >
                  {l.title}
                </Link>
                <p className="mt-1 text-sm text-gray-600">{l.companyName || '会社名未設定'}</p>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                  <span>📍 {l.prefectureLabel || '未設定'}</span>
                  {l.productLabels?.length ? <span>🏷 {l.productLabels.join(', ')}</span> : null}
                  {l.initialCostLabel ? <span>💵 {l.initialCostLabel}</span> : null}
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  size="sm"
                  disabled={busy === l.id}
                  onClick={() => approve(l.id)}
                >
                  承認して公開
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy === l.id}
                  onClick={() => reject(l.id)}
                >
                  却下
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
