'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/providers/AuthProvider';
import { useRequireAuth } from './useRequireAuth';
import type { Advertiser } from '@/types';

export function useRequireAdvertiser() {
  const { user, loading } = useRequireAuth();
  const { profile } = useAuth();
  const [result, setResult] = useState<{
    uid: string;
    advertiser: Advertiser | null;
    error: string;
  } | null>(null);

  useEffect(() => {
    if (!user || loading) return;
    let active = true;
    getDoc(doc(db, 'advertisers', user.uid)).then((snap) => {
      if (!active) return;
      setResult({
        uid: user.uid,
        advertiser: snap.exists() && profile?.role !== 'applicant'
          ? { ...snap.data(), uid: user.uid } as Advertiser
          : null,
        error: snap.exists() && profile?.role !== 'applicant'
          ? ''
          : 'この画面は募集者のみ利用できます。募集者プロフィールを登録してください。',
      });
    }).catch((error: unknown) => {
      if (active) setResult({
        uid: user.uid,
        advertiser: null,
        error: error instanceof Error ? error.message : '募集者情報の取得に失敗しました。',
      });
    });
    return () => { active = false; };
  }, [user, loading, profile?.role]);

  return {
    user,
    advertiser: result?.uid === user?.uid ? result?.advertiser ?? null : null,
    loading: loading || (!!user && result?.uid !== user.uid),
    error: result?.uid === user?.uid ? result?.error ?? '' : '',
  };
}
