'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/providers/AuthProvider';
import type { Listing } from '@/types';

export function useListing(id: string, initialListing: Listing | null = null) {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<{
    listing: Listing | null;
    loading: boolean;
    error: string;
  }>({
    listing: initialListing,
    loading: initialListing === null,
    error: '',
  });

  useEffect(() => {
    if (initialListing?.id === id) {
      setState({ listing: initialListing, loading: false, error: '' });
      return;
    }
    if (authLoading) return;
    let active = true;
    setState({ listing: null, loading: true, error: '' });
    getDoc(doc(db, 'listings', id)).then((snap) => {
      if (active) setState({
        listing: snap.exists() ? { ...snap.data(), id: snap.id } as Listing : null,
        loading: false,
        error: snap.exists() ? '' : '案件が見つかりません。',
      });
    }).catch((error: unknown) => {
      if (active) setState({
        listing: null,
        loading: false,
        error: error instanceof Error ? error.message : '案件の取得に失敗しました。',
      });
    });
    return () => { active = false; };
  }, [id, user?.uid, authLoading, initialListing]);

  return state;
}
