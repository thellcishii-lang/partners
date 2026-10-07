'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/providers/AuthProvider';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useListing } from '@/hooks/useListing';
import { ListingForm } from '@/components/listings/ListingForm';
import type { Advertiser } from '@/types';

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useRequireAuth();
  const { profile } = useAuth();
  const state = useListing(id);

  const [advertiser, setAdvertiser] = useState<Advertiser | null>(null);
  const [advLoading, setAdvLoading] = useState(true);
  const [error, setError] = useState('');

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (authLoading || state.loading || !user || !state.listing) return;

    const isOwner = state.listing.advertiserId === user.uid;
    if (!isOwner && !isAdmin) {
      setError('この案件は編集できません。');
      setAdvLoading(false);
      return;
    }

    // 案件の advertiserId のプロフィールを読み込む（管理者代理編集対応）
    const targetUid = state.listing.advertiserId;
    getDoc(doc(db, 'advertisers', targetUid))
      .then((snap) => {
        if (snap.exists()) {
          setAdvertiser({ ...snap.data(), uid: snap.id } as Advertiser);
        } else {
          setError('募集者プロフィールが見つかりません。');
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : '取得に失敗しました。'))
      .finally(() => setAdvLoading(false));
  }, [user, authLoading, isAdmin, state.listing, state.loading]);

  if (authLoading || state.loading || advLoading) {
    return <p className="text-center text-sm text-gray-500">読み込み中…</p>;
  }
  if (state.error) return <p role="alert" className="text-red-600">{state.error}</p>;
  if (error) return <p role="alert" className="text-red-600">{error}</p>;
  if (!user || !state.listing || !advertiser) return null;

  const isOwner = state.listing.advertiserId === user.uid;
  const adminMode = isAdmin && !isOwner;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {adminMode && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
          <strong>管理者モード</strong>：
          {advertiser.companyName || '（会社名未設定）'} の案件を代理編集中です。
          保存すると即座にサイトに反映されます。
        </div>
      )}
      <h1 className="text-xl font-bold">案件を編集</h1>
      <ListingForm
        key={id}
        advertiser={advertiser}
        listing={state.listing}
        adminMode={adminMode}
      />
    </div>
  );
}
