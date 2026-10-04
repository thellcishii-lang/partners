import Stripe from 'stripe';
import { defineSecret } from 'firebase-functions/params';

// 本番：firebase functions:secrets:set STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET
// エミュレータ：functions/.secret.local に記載（gitignore 対象）
export const STRIPE_SECRET_KEY = defineSecret('STRIPE_SECRET_KEY');
export const STRIPE_WEBHOOK_SECRET = defineSecret('STRIPE_WEBHOOK_SECRET');

export const isEmulator = () => process.env.FUNCTIONS_EMULATOR === 'true';

// 本番では Stripe のキー発行前に "unset" 等の仮値を登録してデプロイする。
// 正しい形式の値だけを「設定済み」とみなす。
export function configuredSecret(value: string | undefined, prefix: string): string | null {
  const v = (value ?? '').trim();
  return v.startsWith(prefix) ? v : null;
}

export function stripeClient(): Stripe | null {
  const key = configuredSecret(STRIPE_SECRET_KEY.value(), 'sk_')
    ?? configuredSecret(STRIPE_SECRET_KEY.value(), 'rk_');
  return key ? new Stripe(key) : null;
}

export function webhookSecret(): string | null {
  return configuredSecret(STRIPE_WEBHOOK_SECRET.value(), 'whsec_');
}
