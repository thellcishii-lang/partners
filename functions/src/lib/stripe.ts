import Stripe from 'stripe';
import { defineSecret } from 'firebase-functions/params';

// 本番：firebase functions:secrets:set STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET
// エミュレータ：functions/.secret.local に記載（gitignore 対象）
export const STRIPE_SECRET_KEY = defineSecret('STRIPE_SECRET_KEY');
export const STRIPE_WEBHOOK_SECRET = defineSecret('STRIPE_WEBHOOK_SECRET');

export const isEmulator = () => process.env.FUNCTIONS_EMULATOR === 'true';

export function stripeClient(): Stripe | null {
  const key = STRIPE_SECRET_KEY.value();
  return key ? new Stripe(key) : null;
}
