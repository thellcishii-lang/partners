export type Role = 'advertiser' | 'applicant' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role?: Role;
  createdAt?: unknown;
}

export interface Advertiser {
  uid: string;
  companyName: string;
  kana?: string;
  industry?: string;
  postalCode?: string;
  prefecture?: string;
  city?: string;
  address?: string;
  building?: string;
  representativeName?: string;
  phone?: string;
  website?: string;
  description?: string;
  // 課金系（read only）
  depositBalance: number;
  plan: 'free' | 'standard' | 'premium';
  freeUntil?: { seconds: number; nanoseconds: number } | null;
  pendingCount: number;
  lowDepositNotified: number | null;
  onboardingCompleted?: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

// ============================================================
// マスタ（categories / areas / costRanges）
// ============================================================
export type CategoryAxis = 'target' | 'product' | 'model';

export interface Category {
  slug: string;
  label: string;
  axis: CategoryAxis;
  parentSlug: string | null;
  order: number;
  seoTitle: string;
  seoDescription: string;
  isActive: boolean;
}

export type AreaType = 'region' | 'prefecture' | 'city';

export interface Area {
  slug: string;
  label: string;
  type: AreaType;
  parentSlug: string | null;
  prefectures: string[];
  order: number;
  seoTitle: string;
  seoDescription: string;
  isActive: boolean;
}

export type CostRangeType = 'initial_cost' | 'expected_revenue';

export interface CostRange {
  slug: string;
  label: string;
  type: CostRangeType;
  min: number;
  max: number | null;
  order: number;
  seoTitle: string;
  isActive: boolean;
}

// ============================================================
// 案件
// ============================================================
export const LISTING_CATEGORIES = ['代理店', '加盟店', 'FC', '業務委託'] as const;
export type ListingCategory = typeof LISTING_CATEGORIES[number];

export type ListingStatus = 'draft' | 'reviewing' | 'published' | 'paused' | 'closed';

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  draft: '下書き',
  reviewing: '審査中',
  published: '公開中',
  paused: '公開停止',
  closed: '募集終了',
};

export interface Listing {
  id: string;
  advertiserId: string;
  companyName: string;
  title: string;
  category: ListingCategory;
  description: string;
  requirements: string;
  reward: string;
  initialCost: string;
  royalty: string;
  area: string;
  images: string[];
  status: ListingStatus;
  publishedAt: { seconds: number; nanoseconds: number } | null;
  createdAt?: unknown;
  updatedAt?: unknown;

  // ============================================================
  // フィルタ用（3軸 + 地域 + 費用）
  // ============================================================
  targetSlugs: string[];        // ['target-retail', 'target-individual']
  targetLabels: string[];       // ['小売・店舗ビジネス', '個人']
  productSlugs: string[];       // ['product-ai-it', 'product-ai']
  productLabels: string[];      // ['AI / IT / DX / SaaS', 'AI']
  modelSlugs: string[];         // ['model-low-risk']
  modelLabels: string[];        // ['簡単・低リスクで始める']

  prefectureSlug: string;       // 'tokyo'
  prefectureLabel: string;      // '東京都'
  regionSlug: string;           // 'kanto'
  regionLabel: string;          // '関東'

  initialCostYen: number | null;    // 数値（円）。不明は null
  initialCostRange: string;         // 'initial-free' など
  initialCostLabel: string;         // '初期費用無料'

  expectedRevenueYen: number | null;
  expectedRevenueRange: string;     // 'revenue-under500' など
  expectedRevenueLabel: string;

  searchText: string;               // 検索用の結合テキスト

  reviewNote?: string | null;
  
  // ============================================================
  // 拡張フィルタ項目
  // ============================================================
  franchiseFeeYen: number | null;
  franchiseFeeRange: string;
  franchiseFeeLabel: string;

  stockType: string;
  stockLabel: string;

  expectedProfitYen: number | null;
  expectedProfitRange: string;
  expectedProfitLabel: string;

  revenueType: string;
  revenueTypeLabel: string;

  organizationType: string;
  organizationTypeLabel: string;
  
  // ============================================================
  // 募集企業情報（詳細ページのサイドバー）
  // ============================================================
  companyAddress?: string;
  companyRepresentative?: string;
  companyEstablished?: string;
  companyBusiness?: string;

  // ============================================================
  // こんな方におすすめ
  // ============================================================
  recommendedFor?: string[];

  // ============================================================
  // ビジネスの説明（番号付き）
  // ============================================================
  businessPoints?: { title: string; body: string }[];

  // ============================================================
  // 詳細情報（サイドバー）
  // ============================================================
  salesTarget?: string;
  salesMethod?: string;
  earnings?: string;
  agentFit?: string[];
  pendingEdit?: {
    data: Partial<Listing>;
    submittedAt: { seconds: number; nanoseconds: number } | null;
    note?: string;
  } | null;

  // 編集審査中かどうかのフラグ（admin 検索用）
  pendingEditSubmitted?: boolean;
}

// ============================================================
// 応募
// ============================================================
export interface ApplicationInput {
  inquiryId: string;
  listingId: string;
  fullName: string;
  kana: string;
  email: string;
  phone: string;
  lineId: string;
  message: string;
  maskedPreview: {
    prefecture: string;
    ageRange: string;
    budget: string;
    hasExperience: boolean;
  };
}
