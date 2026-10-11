'use client';

import Link from 'next/link';
import { Suspense, useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { useRequireAdvertiser } from '@/hooks/useRequireAdvertiser';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';
import {
  UNLIMITED_PRICE_JPY, UNLIMITED_DAYS, withTax, yen,
} from '@/lib/depositPricing';

export default function UnlimitedPage() {
  return <Suspense fallback={<p>読み込み中…</p>}><UnlimitedForm /></Suspense>;
}

function UnlimitedForm() {
  const { user, advertiser, loading, error: profileError } = useRequireAdvertiser();
  const canceled = useSearchParams().get('canceled') === '1';

  // 初期値：明日
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const defaultStart = tomorrow.toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(defaultStart);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const totalJpy = withTax(UNLIMITED_PRICE_JPY);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    if (!startDate) {
      setError('開始日を指定してください。');
      return;
    }
    setSending(true);
    setError('');
    try {
      const startAt = new Date(`${startDate}T00:00:00+09:00`).toISOString();
      const checkout = httpsCallable<
        { startAt: string },
        { orderId: string; url: string }
      >(functions, 'createUnlimitedCheckout');
      const result = await checkout({ startAt });
      window.location.assign(result.data.url);
    } catch (error) {
      setError(error instanceof Error ? error.message : '決済を開始できませんでした。');
      setSending(false);
    }
  };

  if (loading || !user) return <p>読み込み中…</p>;
  if (profileError || !advertiser) {
    return <p role="alert" className="text-red-600">{profileError}</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{UNLIMITED_DAYS}日間 無制限プラン</h1>
        <Link href="/dashboard" className="text-sm text-brand-700 underline">
          マイページへ戻る
        </Link>
      </div>

      {canceled && (
        <p role="status" className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm">
          決済はキャンセルされました。料金は請求されていません。
        </p>
      )}

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-600">プラン内容</p>
        <p className="mt-2 text-2xl font-bold">
          {UNLIMITED_DAYS}日間、応募者情報を受け取り放題
        </p>
        <ul className="mt-3 space-y-1 text-sm text-gray-700">
          <li>・期間中は、デポジットを消費せずに応募者の情報を開示できます</li>
          <li>・開始日から{UNLIMITED_DAYS}日間が対象期間です</li>
          <li>・本プランは返金対象外です</li>
          <li>・通常のデポジット残高には影響しません</li>
        </ul>
      </div>

      <form onSubmit={submit} className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
        <Field label="開始日" required hint="本日以降、1年以内の日付を指定してください">
          <Input
            type="date"
            required
            value={startDate}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Field>

        <div className="flex items-center justify-between border-t pt-4">
          <span className="text-sm text-gray-600">お支払い金額（税込）</span>
          <span className="text-lg font-bold">{yen(totalJpy)}</span>
        </div>

        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

        <Button type="submit" size="lg" className="w-full" loading={sending}>
          {yen(totalJpy)}を支払う
        </Button>
        <p className="text-xs text-gray-500">
          決済は Stripe の安全な決済ページで行われます。
        </p>
      </form>
    </div>
  );
}
