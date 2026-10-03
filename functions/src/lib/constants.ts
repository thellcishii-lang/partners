export const LOW_DEPOSIT_THRESHOLD = 3;      // 残り3以下で通知
export const PENDING_EXPIRE_DAYS = 30;       // 保留の寿命
export const DEPOSIT_VALID_MONTHS = 12;      // デポジット有効期限
export const FREE_TRIAL_MONTHS = 3;          // 登録後3ヶ月無料
export const FREE_TRIAL_CREDITS = 3;         // 無料付与デポジット数

export const COLLECTIONS = {
  USERS: 'users',
  ADVERTISERS: 'advertisers',
  APPLICANTS: 'applicants',
  LISTINGS: 'listings',
  INQUIRIES: 'inquiries',
  INQUIRY_DETAILS: 'inquiryDetails',
  DEPOSIT_TX: 'depositTransactions',
  DEPOSIT_ORDERS: 'depositOrders',
  MAIL_LOGS: 'mailLogs',
  SETTINGS: 'settings',
} as const;
