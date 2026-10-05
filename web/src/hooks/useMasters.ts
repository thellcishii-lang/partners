'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Category, Area, CostRange } from '@/types';

// ============================================================
// マスタデータ（categories / areas / costRanges）をまとめて取得
// モジュールレベルのキャッシュで、複数コンポーネントから呼んでも
// Firestoreへの読み取りは1回だけ
// ============================================================
interface MastersCache {
  categories: Category[];
  areas: Area[];
  costRanges: CostRange[];
  loadedAt: number;
}

let cache: MastersCache | null = null;
let inflight: Promise<MastersCache> | null = null;

const CACHE_TTL_MS = 30 * 60 * 1000; // 30分

async function fetchMasters(): Promise<MastersCache> {
  const [catSnap, areaSnap, costSnap] = await Promise.all([
    getDocs(collection(db, 'categories')),
    getDocs(collection(db, 'areas')),
    getDocs(collection(db, 'costRanges')),
  ]);

  const categories = catSnap.docs
    .map((d) => ({ ...d.data(), slug: d.id } as Category))
    .filter((c) => c.isActive !== false)
    .sort((a, b) => a.order - b.order);

  const areas = areaSnap.docs
    .map((d) => ({ ...d.data(), slug: d.id } as Area))
    .filter((a) => a.isActive !== false)
    .sort((a, b) => a.order - b.order);

  const costRanges = costSnap.docs
    .map((d) => ({ ...d.data(), slug: d.id } as CostRange))
    .filter((c) => c.isActive !== false)
    .sort((a, b) => a.order - b.order);

  return { categories, areas, costRanges, loadedAt: Date.now() };
}

export function useMasters() {
  const [state, setState] = useState<{
    categories: Category[];
    areas: Area[];
    costRanges: CostRange[];
    loading: boolean;
    error: string;
  }>({
    categories: [],
    areas: [],
    costRanges: [],
    loading: true,
    error: '',
  });

  useEffect(() => {
    let active = true;

    async function load() {
      // キャッシュが有効なら即返す
      if (cache && Date.now() - cache.loadedAt < CACHE_TTL_MS) {
        if (active) setState({ ...cache, loading: false, error: '' });
        return;
      }
      try {
        if (!inflight) inflight = fetchMasters();
        const result = await inflight;
        cache = result;
        inflight = null;
        if (active) setState({ ...result, loading: false, error: '' });
      } catch (error) {
        inflight = null;
        if (active) {
          setState({
            categories: [],
            areas: [],
            costRanges: [],
            loading: false,
            error: error instanceof Error ? error.message : 'マスタの取得に失敗しました。',
          });
        }
      }
    }

    load();
    return () => { active = false; };
  }, []);

  return state;
}

// 特定の軸だけ欲しい時のセレクタ
export function useCategoriesByAxis(axis: 'target' | 'product' | 'model') {
  const { categories, loading, error } = useMasters();
  return {
    categories: categories.filter((c) => c.axis === axis),
    loading,
    error,
  };
}
