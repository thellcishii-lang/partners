// デポジット料金：1件（応募の開示）あたり 2,500円。
// web/src/lib/depositPricing.ts と同じ値を保つこと。
export const UNIT_PRICE_JPY = 2500;
export const PRESET_AMOUNTS_JPY = [10000, 30000] as const;
export const CUSTOM_MIN_EXCLUSIVE_JPY = 30000;
// firestore.rules の depositOrders.credits 上限（1000件）に合わせる
export const MAX_AMOUNT_JPY = UNIT_PRICE_JPY * 1000;

export function creditsForAmount(amountJpy: unknown): number | null {
  if (typeof amountJpy !== 'number' || !Number.isInteger(amountJpy)) return null;
  const preset = (PRESET_AMOUNTS_JPY as readonly number[]).includes(amountJpy);
  const custom = amountJpy > CUSTOM_MIN_EXCLUSIVE_JPY &&
    amountJpy <= MAX_AMOUNT_JPY &&
    amountJpy % UNIT_PRICE_JPY === 0;
  return preset || custom ? amountJpy / UNIT_PRICE_JPY : null;
}
