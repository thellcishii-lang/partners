'use client';

import { CATEGORIES, AREAS, COST_RANGES } from '@/lib/masterData';

export function useMasters() {
  return {
    categories: CATEGORIES,
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
