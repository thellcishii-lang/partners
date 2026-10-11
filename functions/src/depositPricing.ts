// 消費税率（変更時はここを書き換える）
// web/src/lib/depositPricing.ts と同じ値を保つこと。
export const TAX_RATE = 0.1;

// デポジット（税抜）
export const UNIT_PRICE_JPY = 2500;
export const PRESET_AMOUNTS_JPY = [10000, 30000] as const;

// 無制限プラン（税抜）
export const UNLIMITED_PRICE_JPY = 75000;
export const UNLIMITED_DAYS = 30;

// 税込に変換
export function withTax(amountJpy: number): number {
  return Math.floor(amountJpy * (1 + TAX_RATE));
}

// プリセット金額 → クレジット数
export function creditsForAmount(amountJpy: unknown): number | null {
  if (typeof amountJpy !== 'number' || !Number.isInteger(amountJpy)) return null;
  const preset = (PRESET_AMOUNTS_JPY as readonly number[]).includes(amountJpy);
  return preset ? amountJpy / UNIT_PRICE_JPY : null;
}
