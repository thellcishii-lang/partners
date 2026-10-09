'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  RecaptchaVerifier,
  linkWithPhoneNumber,
  type ConfirmationResult,
} from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '@/lib/firebase';

export function useSmsVerification(containerId: string) {
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const verifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    return () => {
      if (verifierRef.current) {
        try { verifierRef.current.clear(); } catch { /* noop */ }
        verifierRef.current = null;
      }
    };
  }, []);

  const sendCode = useCallback(async (phoneNumber: string) => {
    function normalizePhone(input: string): string {
  // 全角数字→半角、ハイフン・スペース・カッコを除去
  const cleaned = input
    .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
    .replace(/[\s\-()]/g, '');

  // すでに +81 で始まっていればそのまま
  if (cleaned.startsWith('+81')) return cleaned;
  // 81 で始まる（+なし）なら +81 に
  if (cleaned.startsWith('81')) return `+${cleaned}`;
  // 0 で始まる（国内形式）なら +81 に変換して 0 を除く
  if (cleaned.startsWith('0')) return `+81${cleaned.slice(1)}`;
  // それ以外は + を付けて返す（国際番号想定）
  return `+${cleaned}`;
}
    setLoading(true);
    setError('');
    try {
      if (!auth.currentUser) throw new Error('ログインが必要です。');
      if (!verifierRef.current) {
        verifierRef.current = new RecaptchaVerifier(auth, containerId, {
          size: 'invisible',
        });
      }
      const normalized = normalizePhone(phoneNumber);
const result = await linkWithPhoneNumber(
  auth.currentUser,
  normalized,
  verifierRef.current,
);
      setConfirmation(result);
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'SMS送信に失敗しました。';
      setError(
        msg.includes('invalid-phone-number') ? '電話番号の形式が正しくありません。'
          : msg.includes('too-many-requests') ? 'リクエストが多すぎます。しばらくしてからお試しください。'
            : msg.includes('captcha-check-failed') ? 'reCAPTCHA認証に失敗しました。再度お試しください。'
              : msg
      );
      return false;
    } finally {
      setLoading(false);
    }
  }, [containerId]);

  const verifyCode = useCallback(async (code: string) => {
    if (!confirmation) {
      setError('先にSMSを送信してください。');
      return false;
    }
    setLoading(true);
    setError('');
    try {
      await confirmation.confirm(code);
      // サーバー側でカスタムクレームを設定
      const fn = httpsCallable<unknown, { ok: boolean }>(functions, 'setSmsVerified');
      await fn({});
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : '認証に失敗しました。';
      setError(
        msg.includes('invalid-verification-code') ? '認証コードが正しくありません。'
          : msg.includes('code-expired') ? '認証コードの有効期限が切れています。再送してください。'
            : msg
      );
      return false;
    } finally {
      setLoading(false);
    }
  }, [confirmation]);

  return { sendCode, verifyCode, loading, error, confirmation };
}
