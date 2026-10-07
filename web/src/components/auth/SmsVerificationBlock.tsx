'use client';

import { useId, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Field } from '@/components/ui/Input';
import { useSmsVerification } from '@/hooks/useSmsVerification';
import { useAuth } from '@/providers/AuthProvider';

export function SmsVerificationBlock({
  description = 'この操作にはSMS認証が必要です。',
  onVerified,
}: {
  description?: string;
  onVerified?: () => void;
}) {
  const reactId = useId();
  const containerId = `recaptcha-${reactId.replace(/:/g, '')}`;
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [stage, setStage] = useState<'phone' | 'code'>('phone');
  const { sendCode, verifyCode, loading, error } = useSmsVerification(containerId);
  const { refreshClaims } = useAuth();

  const handleSend = async () => {
    const ok = await sendCode(phone.trim());
    if (ok) setStage('code');
  };

  const handleVerify = async () => {
    const ok = await verifyCode(code.trim());
    if (ok) {
      await refreshClaims();
      onVerified?.();
    }
  };

  return (
    <div className="space-y-3 rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4">
      <p className="text-sm font-medium text-emerald-900">{description}</p>
      <div id={containerId} />

      {stage === 'phone' && (
        <>
          <Field label="電話番号" required>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="090-1234-5678"
              autoComplete="tel"
            />
          </Field>
          <Button
            type="button"
            disabled={loading || !phone.trim()}
            loading={loading}
            onClick={handleSend}
          >
            SMSを送信
          </Button>
        </>
      )}

      {stage === 'code' && (
        <>
          <p className="text-xs text-emerald-700">
            {phone} に送信された6桁のコードを入力してください。
          </p>
          <Field label="認証コード" required>
            <Input
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              maxLength={6}
              placeholder="123456"
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={loading || code.length < 6}
              loading={loading}
              onClick={handleVerify}
            >
              認証する
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => { setStage('phone'); setCode(''); }}
              disabled={loading}
            >
              電話番号を変更
            </Button>
          </div>
        </>
      )}

      {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
