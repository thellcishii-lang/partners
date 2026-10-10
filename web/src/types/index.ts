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

   areaMode: 'nationwide' | 'region' | 'prefecture';
  areaSlugs: string[];
  areaLabels: string[];

  // 検索用（保存時に自動展開）
  areaSearchPrefectureSlugs: string[];
  areaSearchRegionSlugs: string[];        // '関東'

   // 資料（PDF・PPT・画像）
  documents?: ListingDocument[];

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

  organizationTypes: string[];
  organizationTypeLabels: string[];
  
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
// 案件資料
// ============================================================
export interface ListingDocument {
  /** 元のファイル名（メール添付時の名前） */
  name: string;
  /** ダウンロードURL */
  url: string;
  /** Storage パス（削除用） */
  path: string;
  /** バイトサイズ */
  size: number;
  /** MIMEタイプ */
  type: string;
}

// ============================================================
// 応募（inquiries / inquiryDetails）
// ============================================================
export type InquiryStatus =
  | 'pending'
  | 'delivered'
  | 'won'
  | 'lost'
  | 'cancelled'
  | 'expired';

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  pending: '未開示（保留）',
  delivered: '開示済み',
  won: '採用',
  lost: '不採用',
  cancelled: '辞退',
  expired: '期限切れ',
};

export interface Inquiry {
  id: string;
  listingId: string;
  advertiserId: string;
  applicantId: string;
  status: InquiryStatus;
  maskedPreview: {
    prefecture: string;
    ageRange: string;
    budget: string;
    hasExperience: boolean;
  };
  depositTransactionId: string | null;
  deliveredAt: { seconds: number; nanoseconds: number } | null;
  createdAt: { seconds: number; nanoseconds: number } | null;
  memo?: string;
}

export interface InquiryDetail {
  inquiryId: string;
  applicantId: string;
  advertiserId: string;
  fullName: string;
  kana: string;
  email: string;
  phone: string;
  lineId: string;
  message: string;
  snapshot?: {
    displayName?: string;
    email?: string;
  };
  createdAt?: unknown;
}
export interface ApplicationInput {
  inquiryId: string;
  listingId: string;
  fullName: string;
  kana: string;
  email: string;
  phone: string;
  postalCode: string;
  prefecture: string;
  city: string;
  address: string;
  building: string;
  message: string;
}
