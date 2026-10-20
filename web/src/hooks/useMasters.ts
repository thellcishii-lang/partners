'use client';

import { CATEGORIES, AREAS, COST_RANGES } from '@/lib/masterData';

export function useMasters(industry?: string) {
  const filteredCategories = industry
    ? CATEGORIES.filter((c) => c.industry === industry)
    : CATEGORIES.filter((c) => !c.industry); // industry指定がない場合は既存の全業種カテゴリのみ

  return {
    categories: filteredCategories,
    areas: AREAS,
    costRanges: COST_RANGES,
    loading: false,
    error: '',
  };
}

export function useCategoriesByAxis(axis: 'target' | 'product' | 'model') {
  return {
    categories: CATEGORIES.filter((c) => c.axis === axis),
    loading: false,
    error: '',
  };
}
