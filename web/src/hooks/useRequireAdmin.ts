'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';

// AuthProvider は users/{uid} を読んでから loading を false にする。
// そのため loading が false の時点で profile は確定している。
export function useRequireAdmin(redirect = '/login') {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(redirect);
      return;
    }
    if (profile?.role !== 'admin') {
      router.replace('/');
    }
  }, [user, profile, loading, router, redirect]);

  return {
    user,
    profile,
    isAdmin: profile?.role === 'admin',
    loading,
  };
}
