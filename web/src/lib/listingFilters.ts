export {
  EXPECTED_REVENUE_RANGES,
  FRANCHISE_FEE_RANGES,
  INITIAL_COST_RANGES,
  ORGANIZATION_TYPES,
  PREFECTURE_TO_REGION,
  PROFIT_AMOUNTS,
  REGION_LABELS,
  REVENUE_AMOUNTS,
  REVENUE_TYPES,
  STOCK_TYPES,
  getExpectedRevenueLabel,
  getExpectedRevenueRange,
  getFranchiseFeeRange,
  getInitialCostLabel,
  getInitialCostRange,
  getRegionLabel,
  getRegionSlug,
} from '@/lib/masterData';
export type {
  ExpectedRevenueRangeSlug,
  InitialCostRangeSlug,
} from '@/lib/masterData';

export function buildSearchText(input: {
  title: string;
  description: string;
  targetLabels: string[];
  productLabels: string[];
  modelLabels: string[];
  prefectureLabel: string;
  regionLabel: string;
  category: string;
  companyName: string;
}): string {
  return [
    input.title,
    input.description,
    input.companyName,
    input.category,
    ...input.targetLabels,
    ...input.productLabels,
    ...input.modelLabels,
    input.prefectureLabel,
    input.regionLabel,
  ]
    .filter(Boolean)
    .join(' ')
    .slice(0, 5000);
}
