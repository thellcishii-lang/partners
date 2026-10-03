'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { doc, getDoc, collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/Button';
import type { Advertiser } from '@/types';

export default function DashboardPage() {
  const { user, loading } = useRequireAuth();
  const [adv, setAdv] = useState<Advertiser | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [deliveredCount, setDeliveredCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const snap = await getDoc(doc(db, 'advertisers', user.uid));
      setAdv(snap.exists() ? ({ uid: user.uid, ...snap.data() } as Advertiser) : null);

      const [p, d] = await Promise.all([
        getCountFromServer(
          query(collection(db, 'inquiries'), where('advertiserId', '==', user.uid), where('status', '==', 'pending'))
        ),
        getCountFromServer(
          query(collection(db, 'inquiries'), where('advertiserId', '==', user.uid), where('status', '==', 'delivered'))
        ),
      ]);
      setPendingCount(p.data().count);
      setDeliveredCount(d.data().count);
    })();
  }, [user]);

  if (loading || !adv) return <p className="text-center text-sm text-gray-500">読み込み中…</p>;

  const balance = adv.depositBalance ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">マイページ</h1>
        <Link href="/listings/new">
          <Button>案件を作成</Button>
        </Link>
      </div>

      {!adv.onboardingCompleted && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm">
          掲載に必要な情報が未入力です。
          <Link href="/onboarding" className="ml-1 text-brand-700 underline">
            入力を完了する
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card label="残りデポジット" value={balance} unit="件" highlight={balance <= 3} />
        <Card label="未開示（保留）" value={pendingCount} unit="件" highlight={pendingCount > 0} />
        <Card label="開示済み" value={deliveredCount} unit="件" />
      </div>

      {balance <= 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">
            デポジットが不足しています。追加すると、保留中の問い合わせ内容が確認できます。
          </p>
          <Link href="/deposit">
            <Button className="mt-3" variant="primary">デポジットを追加</Button>
          </Link>
        </div>
      )}

      {balance > 0 && balance <= 3 && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
          残り{balance}件です。お早めに追加をご検討ください。
        </div>
      )}
    </div>
  );
}

function Card({ label, value, unit, highlight }: { label: string; value: number; unit: string; highlight?: boolean }) {
  return (
    <div className={'rounded-2xl bg-white p-5 shadow-sm ' + (highlight ? 'ring-2 ring-orange-300' : '')}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold">
        {value}
        <span className="ml-1 text-sm font-normal text-gray-500">{unit}</span>
      </p>
    </div>
  );
}
