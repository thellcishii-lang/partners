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
}

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
