// functions/src/depositPricing.ts と同じ値を保つこと（金額の最終検証はサーバー側）。
export const UNIT_PRICE_JPY = 2500;
export const PRESET_AMOUNTS_JPY = [10000, 30000] as const;
export const CUSTOM_MIN_EXCLUSIVE_JPY = 30000;
export const MAX_AMOUNT_JPY = UNIT_PRICE_JPY * 1000;

export function creditsForAmount(amountJpy: number): number | null {
  if (!Number.isInteger(amountJpy)) return null;
  const preset = (PRESET_AMOUNTS_JPY as readonly number[]).includes(amountJpy);
  const custom = amountJpy > CUSTOM_MIN_EXCLUSIVE_JPY &&
    amountJpy <= MAX_AMOUNT_JPY &&
    amountJpy % UNIT_PRICE_JPY === 0;
  return preset || custom ? amountJpy / UNIT_PRICE_JPY : null;
}

export const yen = (value: number) => `${value.toLocaleString('ja-JP')}円`;
