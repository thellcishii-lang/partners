'use client';

import Link from 'next/link';
import { Suspense, useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { useRequireAdvertiser } from '@/hooks/useRequireAdvertiser';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';
import { cn } from '@/lib/cn';
import {
  CUSTOM_MIN_EXCLUSIVE_JPY, MAX_AMOUNT_JPY, PRESET_AMOUNTS_JPY, UNIT_PRICE_JPY, creditsForAmount, yen,
} from '@/lib/depositPricing';

type Choice = (typeof PRESET_AMOUNTS_JPY)[number] | 'custom';

export default function DepositPage() {
  return <Suspense fallback={<p>読み込み中…</p>}><DepositForm /></Suspense>;
}

function DepositForm() {
  const { user, advertiser, loading, error: profileError } = useRequireAdvertiser();
  const canceled = useSearchParams().get('canceled') === '1';
  const [choice, setChoice] = useState<Choice>(PRESET_AMOUNTS_JPY[0]);
  const [custom, setCustom] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const amount = choice === 'custom' ? Number(custom) : choice;
  const credits = creditsForAmount(amount);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    if (credits === null) {
      setError(`${yen(CUSTOM_MIN_EXCLUSIVE_JPY)}を超える ${yen(UNIT_PRICE_JPY)}単位の金額を入力してください。`);
      return;
    }
    setSending(true);
    setError('');
    try {
      const checkout = httpsCallable<{ amountJpy: number }, { orderId: string; url: string }>(
        functions, 'createDepositCheckout');
      const result = await checkout({ amountJpy: amount });
      window.location.assign(result.data.url);
    } catch (error) {
      setError(error instanceof Error ? error.message : '決済を開始できませんでした。');
      setSending(false);
    }
  };

  if (loading || !user) return <p>読み込み中…</p>;
  if (profileError || !advertiser) return <p role="alert" className="text-red-600">{profileError}</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">デポジットを追加</h1>
        <Link href="/dashboard" className="text-sm text-brand-700 underline">マイページへ戻る</Link>
      </div>
      {canceled && (
        <p role="status" className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm">
          決済はキャンセルされました。料金は請求されていません。
        </p>
      )}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-600">現在の残高</p>
        <p className="text-2xl font-bold">{advertiser.depositBalance ?? 0}<span className="ml-1 text-base">件</span></p>
        <p className="mt-2 text-xs text-gray-500">
          応募内容が開示されるごとに 1件（{yen(UNIT_PRICE_JPY)}）を消費します。追加すると、保留中の応募は古い順に自動で開示されます。
        </p>
      </div>
      <form onSubmit={submit} className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
        <fieldset className="space-y-3">
          <legend className="mb-2 text-sm font-medium text-gray-800">金額を選択</legend>
          {[...PRESET_AMOUNTS_JPY, 'custom' as const].map((value) => (
            <label key={value} className={cn(
              'flex cursor-pointer items-center justify-between rounded-xl border p-4',
              choice === value ? 'border-brand-600 bg-brand-50' : 'border-gray-200',
            )}>
              <span className="flex items-center gap-3">
                <input type="radio" name="amount" value={value} checked={choice === value}
                  onChange={() => { setChoice(value); setError(''); }} />
                <span className="font-medium">{value === 'custom' ? '金額を入力' : yen(value)}</span>
              </span>
              {value !== 'custom' && <span className="text-sm text-gray-600">{value / UNIT_PRICE_JPY}件分</span>}
            </label>
          ))}
        </fieldset>
        {choice === 'custom' && (
          <Field label="金額（円）" required
            hint={`${yen(CUSTOM_MIN_EXCLUSIVE_JPY)}を超える ${yen(UNIT_PRICE_JPY)}単位（上限 ${yen(MAX_AMOUNT_JPY)}）`}>
            <Input aria-label="金額（円）" type="number" inputMode="numeric" required
              min={CUSTOM_MIN_EXCLUSIVE_JPY + UNIT_PRICE_JPY} max={MAX_AMOUNT_JPY} step={UNIT_PRICE_JPY}
              value={custom} onChange={(e) => { setCustom(e.target.value); setError(''); }} />
          </Field>
        )}
        <div className="flex items-center justify-between border-t pt-4">
          <span className="text-sm text-gray-600">追加される件数</span>
          <span className="text-lg font-bold">{credits ?? '—'}<span className="ml-1 text-sm">件</span></span>
        </div>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={sending || credits === null}>
          {sending ? '決済ページへ移動中…' : credits === null ? '金額を入力してください' : `${yen(amount)}を支払う`}
        </Button>
        <p className="text-xs text-gray-500">決済は Stripe の安全な決済ページで行われます。</p>
      </form>
    </div>
  );
}
