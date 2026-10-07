'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { doc, getDoc, getDocs, collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/Button';
import { PreviewModal } from '@/components/listings/PreviewModal';
import { LISTING_STATUS_LABELS, type Advertiser, type Listing } from '@/types';

export default function DashboardPage() {
  const { user, loading } = useRequireAuth();
  const [adv, setAdv] = useState<Advertiser | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [deliveredCount, setDeliveredCount] = useState(0);
  const [listings, setListings] = useState<Listing[]>([]);
  const [previewListing, setPreviewListing] = useState<Listing | null>(null);
  const [error, setError] = useState('');
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setDataLoading(true);
    setError('');
    (async () => {
      const snap = await getDoc(doc(db, 'advertisers', user.uid));
      if (!snap.exists()) throw new Error('募集者プロフィールがありません。募集者登録を行ってください。');

      const [p, d, ownListings] = await Promise.all([
        getCountFromServer(
          query(collection(db, 'inquiries'), where('advertiserId', '==', user.uid), where('status', '==', 'pending'))
        ),
        getCountFromServer(
          query(collection(db, 'inquiries'), where('advertiserId', '==', user.uid), where('status', '==', 'delivered'))
        ),
        getDocs(query(collection(db, 'listings'), where('advertiserId', '==', user.uid))),
      ]);
      if (!active) return;
      setAdv({ ...snap.data(), uid: user.uid } as Advertiser);
      setPendingCount(p.data().count);
      setDeliveredCount(d.data().count);
      setListings(ownListings.docs.map((item) => ({ ...item.data(), id: item.id } as Listing)));
    })().catch((error: unknown) => {
      if (active) setError(error instanceof Error ? error.message : 'ダッシュボードの取得に失敗しました。');
    }).finally(() => { if (active) setDataLoading(false); });
    return () => { active = false; };
  }, [user]);

  if (loading || !user || dataLoading) return <p className="text-center text-sm text-gray-500">読み込み中…</p>;
  if (error || !adv) return <p role="alert" className="text-red-600">{error}</p>;

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

      {balance > 0 && (
        <div className="text-right">
          <Link href="/deposit" className="text-sm text-brand-700 underline">デポジットを追加</Link>
        </div>
      )}

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

      <section className="space-y-4">
        <h2 className="text-lg font-bold">自分の案件一覧</h2>
        {listings.length === 0 && <p className="text-sm text-gray-600">まだ案件がありません。</p>}
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-5 shadow-sm"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{listing.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-gray-100 px-3 py-1">
                  {LISTING_STATUS_LABELS[listing.status]}
                </span>
                {listing.pendingEdit?.submittedAt && (
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-orange-800">
                    編集審査中
                  </span>
                )}
                {listing.pendingEdit && !listing.pendingEdit.submittedAt && (
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-yellow-800">
                    未提出の変更あり
                  </span>
                )}
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPreviewListing(listing)}
              >
                プレビュー
              </Button>
              <Link href={`/listings/${listing.id}/edit`}>
                <Button size="sm" variant="outline">編集</Button>
              </Link>
            </div>
          </div>
        ))}
      </section>

      {previewListing && (
        <PreviewModal
          listing={previewListing}
          onClose={() => setPreviewListing(null)}
        />
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
