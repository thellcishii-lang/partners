export type Role = 'advertiser' | 'applicant' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
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
