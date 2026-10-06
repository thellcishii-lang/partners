import { CATEGORIES, AREAS, COST_RANGES } from './masterData';

// ============================================================
// ラベルマップ（masterData.ts から自動生成）
// ============================================================
export const TARGET_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.filter((c) => c.axis === 'target').map((c) => [c.slug, c.label])
);
export const PRODUCT_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.filter((c) => c.axis === 'product').map((c) => [c.slug, c.label])
);
export const MODEL_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.filter((c) => c.axis === 'model').map((c) => [c.slug, c.label])
);

export interface AreaInfo {
  label: string;
  type: 'region' | 'prefecture';
}

export const AREA_LABELS: Record<string, AreaInfo> = Object.fromEntries(
  AREAS.map((a) => [a.slug, { label: a.label, type: a.type as 'region' | 'prefecture' }])
);

export const INITIAL_COST_LABELS: Record<string, string> = Object.fromEntries(
  COST_RANGES.filter((c) => c.type === 'initial_cost').map((c) => [c.slug, c.label])
);

// ============================================================
// ヘルパー
// ============================================================
export function getCategoryLabel(slug: string): string {
  return TARGET_LABELS[slug] ?? PRODUCT_LABELS[slug] ?? MODEL_LABELS[slug] ?? slug;
}
export function getAreaLabel(slug: string): string | null {
  return AREA_LABELS[slug]?.label ?? null;
}
export function getAreaType(slug: string): 'region' | 'prefecture' | null {
  return AREA_LABELS[slug]?.type ?? null;
}
export function getInitialCostLabel(slug: string): string | null {
  return INITIAL_COST_LABELS[slug] ?? null;
}
