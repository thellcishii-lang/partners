// ============================================================
// 案件のフィルタ用計算ロジック
// functions/seed-masters.mjs の定義と整合させること
// ============================================================

// ============================================================
// 都道府県 slug → 地域 slug
// ============================================================
export const PREFECTURE_TO_REGION: Record<string, string> = {
  hokkaido: 'hokkaido',
  aomori: 'tohoku', iwate: 'tohoku', miyagi: 'tohoku',
  akita: 'tohoku', yamagata: 'tohoku', fukushima: 'tohoku',
  tokyo: 'kanto', kanagawa: 'kanto', saitama: 'kanto',
  chiba: 'kanto', ibaraki: 'kanto', tochigi: 'kanto', gunma: 'kanto',
  niigata: 'chubu', toyama: 'chubu', ishikawa: 'chubu',
  fukui: 'chubu', yamanashi: 'chubu', nagano: 'chubu',
  gifu: 'chubu', shizuoka: 'chubu', aichi: 'chubu',
  mie: 'kansai', shiga: 'kansai', kyoto: 'kansai',
  osaka: 'kansai', hyogo: 'kansai', nara: 'kansai', wakayama: 'kansai',
  tottori: 'chugoku', shimane: 'chugoku', okayama: 'chugoku',
  hiroshima: 'chugoku', yamaguchi: 'chugoku',
  tokushima: 'shikoku', kagawa: 'shikoku', ehime: 'shikoku', kochi: 'shikoku',
  fukuoka: 'kyushu', saga: 'kyushu', nagasaki: 'kyushu',
  kumamoto: 'kyushu', oita: 'kyushu', miyazaki: 'kyushu',
  kagoshima: 'kyushu', okinawa: 'kyushu',
};

export const REGION_LABELS: Record<string, string> = {
  all: '全国',
  hokkaido: '北海道',
  tohoku: '東北',
  kanto: '関東',
  chubu: '中部',
  kansai: '関西',
  chugoku: '中国',
  shikoku: '四国',
  kyushu: '九州・沖縄',
};

// ============================================================
// 初期費用レンジ
// ============================================================
export type InitialCostRangeSlug =
  | 'initial-free'
  | 'initial-under100'
  | 'initial-under300'
  | 'initial-over300'
  | 'initial-unknown';

export const INITIAL_COST_RANGES: {
  slug: InitialCostRangeSlug;
  label: string;
}[] = [
  { slug: 'initial-free',     label: '初期費用無料' },
  { slug: 'initial-under100', label: '100万円以下' },
  { slug: 'initial-under300', label: '300万円以下' },
  { slug: 'initial-over300',  label: '300万円以上' },
  { slug: 'initial-unknown',  label: '応相談' },
];

export function getInitialCostRange(yen: number | null): InitialCostRangeSlug {
  if (yen === null) return 'initial-unknown';
  if (yen === 0) return 'initial-free';
  if (yen <= 1_000_000) return 'initial-under100';
  if (yen <= 3_000_000) return 'initial-under300';
  return 'initial-over300';
}

export function getInitialCostLabel(slug: string): string {
  return INITIAL_COST_RANGES.find((r) => r.slug === slug)?.label ?? '応相談';
}

// ============================================================
// 想定売上（年商）レンジ
// ============================================================
export type ExpectedRevenueRangeSlug =
  | 'revenue-under500'
  | 'revenue-under1000'
  | 'revenue-over1000'
  | 'revenue-unknown';

export const EXPECTED_REVENUE_RANGES: {
  slug: ExpectedRevenueRangeSlug;
  label: string;
}[] = [
  { slug: 'revenue-under500',  label: '年商500万円以下' },
  { slug: 'revenue-under1000', label: '年商1000万円以下' },
  { slug: 'revenue-over1000',  label: '年商1000万円以上' },
  { slug: 'revenue-unknown',   label: '応相談' },
];

export function getExpectedRevenueRange(yen: number | null): ExpectedRevenueRangeSlug {
  if (yen === null) return 'revenue-unknown';
  if (yen <= 5_000_000) return 'revenue-under500';
  if (yen <= 10_000_000) return 'revenue-under1000';
  return 'revenue-over1000';
}

export function getExpectedRevenueLabel(slug: string): string {
  return EXPECTED_REVENUE_RANGES.find((r) => r.slug === slug)?.label ?? '応相談';
}

// ============================================================
// 地域
// ============================================================
export function getRegionSlug(prefectureSlug: string): string {
  if (prefectureSlug === 'all') return 'all';
  return PREFECTURE_TO_REGION[prefectureSlug] ?? 'other';
}

export function getRegionLabel(prefectureSlug: string): string {
  if (prefectureSlug === 'all') return '全国';
  const region = getRegionSlug(prefectureSlug);
  return REGION_LABELS[region] ?? 'その他';
}

// ============================================================
// 検索用テキスト生成
// ============================================================
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

// ============================================================
// 加盟金（0円〜）
// ============================================================
export const FRANCHISE_FEE_RANGES = [
  { slug: 'free',     label: '無料' },
  { slug: 'under10',  label: '10万円以下' },
  { slug: 'under50',  label: '50万円以下' },
  { slug: 'under100', label: '100万円以下' },
  { slug: 'over100',  label: '100万円以上' },
] as const;

export function getFranchiseFeeRange(yen: number | null): string {
  if (yen === null) return '';
  if (yen === 0) return 'free';
  if (yen <= 100_000) return 'under10';
  if (yen <= 500_000) return 'under50';
  if (yen <= 1_000_000) return 'under100';
  return 'over100';
}

export function getFranchiseFeeLabel(yen: number | null): string {
  const slug = getFranchiseFeeRange(yen);
  return FRANCHISE_FEE_RANGES.find((r) => r.slug === slug)?.label ?? '応相談';
}

// ============================================================
// 仕入れ
// ============================================================
export const STOCK_TYPES = [
  { slug: 'none',      label: '仕入れ不要' },
  { slug: 'single',    label: '1個から' },
  { slug: 'small_lot', label: '小ロット' },
  { slug: 'no_risk',   label: '在庫リスクなし' },
  { slug: 'buyback',   label: '買取あり' },
] as const;

export type StockTypeSlug = (typeof STOCK_TYPES)[number]['slug'];

export function getStockLabel(slug: string): string {
  return STOCK_TYPES.find((t) => t.slug === slug)?.label ?? '';
}

// ============================================================
// 売上推定：月商レンジ（4段階）
// ============================================================
export const REVENUE_AMOUNTS = [
  { slug: 'under50',  label: '〜50万円/月' },
  { slug: 'under100', label: '〜100万円/月' },
  { slug: 'under300', label: '〜300万円/月' },
  { slug: 'over300',  label: '300万円以上' },
] as const;

export function getRevenueAmountRange(yen: number | null): string {
  if (yen === null) return '';
  if (yen <= 500_000) return 'under50';
  if (yen <= 1_000_000) return 'under100';
  if (yen <= 3_000_000) return 'under300';
  return 'over300';
}

export function getRevenueAmountLabel(yen: number | null): string {
  const slug = getRevenueAmountRange(yen);
  return REVENUE_AMOUNTS.find((r) => r.slug === slug)?.label ?? '';
}

// ============================================================
// 利益推定：月利益レンジ（3段階）。売上とは別指標
// ============================================================
export const PROFIT_AMOUNTS = [
  { slug: 'under50',  label: '〜50万円/月' },
  { slug: 'over50',   label: '50万円以上' },
  { slug: 'over100',  label: '100万円以上' },
] as const;

export function getProfitAmountRange(yen: number | null): string {
  if (yen === null) return '';
  if (yen <= 500_000) return 'under50';
  if (yen <= 1_000_000) return 'over50';
  return 'over100';
}

export function getProfitAmountLabel(yen: number | null): string {
  const slug = getProfitAmountRange(yen);
  return PROFIT_AMOUNTS.find((r) => r.slug === slug)?.label ?? '';
}

// ============================================================
// 収益タイプ
// ============================================================
export const REVENUE_TYPES = [
  { slug: 'stock', label: 'ストック型' },
  { slug: 'flow',  label: 'フロー型' },
  { slug: 'both',  label: '複合型' },
] as const;

export function getRevenueTypeLabel(slug: string): string {
  return REVENUE_TYPES.find((t) => t.slug === slug)?.label ?? '';
}

// ============================================================
// 組織拡大
// ============================================================
export const ORGANIZATION_TYPES = [
  { slug: 'individual', label: '個人可' },
  { slug: 'side_job',   label: '副業可' },
  { slug: 'org',        label: '組織拡大可' },
  { slug: 'corp',       label: '法人のみ' },
] as const;

export function getOrganizationTypeLabel(slug: string): string {
  return ORGANIZATION_TYPES.find((t) => t.slug === slug)?.label ?? '';
}
