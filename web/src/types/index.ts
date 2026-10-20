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
  unlimitedUntil?: { seconds: number; nanoseconds: number } | null;
  refundRequestedAt?: { seconds: number; nanoseconds: number } | null;
  refundCompletedAt?: { seconds: number; nanoseconds: number } | null;
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
  industry?: string;
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
  targetSlugs: string[];
  targetLabels: string[];
  productSlugs: string[];
  productLabels: string[];
  modelSlugs: string[];
  modelLabels: string[];

  areaMode: 'nationwide' | 'region' | 'prefecture';
  areaSlugs: string[];
  areaLabels: string[];

  areaSearchPrefectureSlugs: string[];
  areaSearchRegionSlugs: string[];

  documents?: ListingDocument[];

  initialCostYen: number | null;
  initialCostRange: string;
  initialCostLabel: string;

  expectedRevenueYen: number | null;
  expectedRevenueRange: string;
  expectedRevenueLabel: string;

  searchText: string;

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

  recommendedFor?: string[];

  businessPoints?: { title: string; body: string }[];

  salesTarget?: string;
  salesMethod?: string;
  earnings?: string;
  agentFit?: string[];

  pendingEdit?: {
    data: Partial<Listing>;
    submittedAt: { seconds: number; nanoseconds: number } | null;
    note?: string;
  } | null;

  /** 管理者による公開停止中かどうか（募集者は再公開できない） */
  adminSuspended?: boolean;
  pendingEditSubmitted?: boolean;

  /** 上部表示中かどうか */
  isPromotedTop?: boolean;
  /** おすすめ表示中かどうか */
  isPromotedRecommend?: boolean;
  /** 上部表示の有効期限 */
  promotedTopUntil?: { seconds: number; nanoseconds: number } | null;
  /** おすすめ表示の有効期限 */
  promotedRecommendUntil?: { seconds: number; nanoseconds: number } | null;
}

// ============================================================
// 案件資料
// ============================================================
export interface ListingDocument {
  name: string;
  url: string;
  path: string;
  size: number;
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
  listingId?: string;
  fullName: string;
  kana: string;
  email: string;
  phone: string;
  postalCode?: string;
  prefecture?: string;
  city?: string;
  address?: string;
  building?: string;
  lineId?: string;
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

// ============================================================
// おすすめ表示（有料オプション）
// ============================================================
export type PromotionPlan = 'top' | 'recommend';
export type PromotionBillingType = 'one_time' | 'subscription';
export type PromotionStatus = 'pending' | 'active' | 'expired' | 'canceled';

export const PROMOTION_PLAN_LABELS: Record<PromotionPlan, string> = {
  top: '上部表示',
  recommend: 'おすすめ表示',
};

export const PROMOTION_STATUS_LABELS: Record<PromotionStatus, string> = {
  pending: '決済待ち',
  active: '掲載中',
  expired: '終了',
  canceled: 'キャンセル',
};

export interface ListingPromotion {
  id: string;
  advertiserId: string;
  listingId: string;
  plan: PromotionPlan;
  priceJpy: number;
  totalJpy: number;
  taxRate: number;
  billingType: PromotionBillingType;
  startAt: { seconds: number; nanoseconds: number };
  endAt: { seconds: number; nanoseconds: number } | null;
  status: PromotionStatus;
  stripeSessionId: string | null;
  stripeSubscriptionId: string | null;
  paidAt: { seconds: number; nanoseconds: number } | null;
  createdAt?: { seconds: number; nanoseconds: number } | null;
  updatedAt?: { seconds: number; nanoseconds: number } | null;
  canceledAt?: { seconds: number; nanoseconds: number } | null;
}
