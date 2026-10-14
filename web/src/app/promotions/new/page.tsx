'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/lib/firebase';
import { useRequireAdvertiser } from '@/hooks/useRequireAdvertiser';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';
import type { Listing } from '@/types';

export default function NewPromotionPage() {
  return <Suspense fallback={<p>読み込み中…</p>}><Content /></Suspense>;
}

function Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') as 'top' | 'recommend' | null;
  const { user, advertiser, loading, error: profileError } = useRequireAdvertiser();

  const [listings, setListings] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [listingId, setListingId] = useState('');
  const [billingType, setBillingType] = useState<'one_time' | 'subscription'>('one_time');

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const [startDate, setStartDate] = useState(tomorrow.toISOString().slice(0, 10));

  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!plan || (plan !== 'top' && plan !== 'recommend')) {
      router.replace('/promotions');
    }
  }, [plan, router]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const snap = await getDocs(
        query(
          collection(db, 'listings'),
          where('advertiserId', '==', user.uid),
          where('status', '==', 'published'),
        )
      );
      if (!active) return;
      setListings(snap.docs.map((d) => ({ ...d.data(), id: d.id } as Listing)));
      setListingsLoading(false);
    })().catch(() => { if (active) setListingsLoading(false); });
    return () => { active = false; };
  }, [user]);

  const priceJpy = plan === 'top' ? 55000 : 33000;
  const totalJpy = Math.floor(priceJpy * 1.1);
  const planLabel = plan === 'top' ? '上部表示' : 'おすすめ表示';

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending || !plan || !listingId) return;
    setSending(true);
    setError('');
    try {
      const startAt = new Date(`${startDate}T00:00:00+09:00`).toISOString();
      const fn = httpsCallable<
        { plan: string; billingType: string; listingId: string; startAt: string },
        { promotionId: string; url: string }
      >(functions, 'createPromotionCheckout');
      const result = await fn({ plan, billingType, listingId, startAt });
      window.location.assign(result.data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : '決済を開始できませんでした。');
      setSending(false);
    }
  };

  if (loading || !user || listingsLoading) {
    return <p className="p-4 text-sm text-gray-500">読み込み中…</p>;
  }
  if (profileError || !advertiser) {
    return <p role="alert" className="p-4 text-red-600">{profileError}</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/promotions" className="text-xs text-gray-500 hover:underline">
          ← プラン一覧
        </Link>
        <h1 className="mt-1 text-xl font-bold">{planLabel}のお申し込み</h1>
      </div>

      {listings.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-700">
            公開中の案件がありません。先に案件を公開してください。
          </p>
          <Link href="/dashboard" className="mt-3 inline-block text-sm text-brand-700 underline">
            マイページへ
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
          <Field label="対象の案件" required>
            <select
              className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm"
              value={listingId}
              onChange={(e) => setListingId(e.target.value)}
              required
            >
              <option value="">選択してください</option>
              {listings.map((l) => (
                <option key={l.id} value={l.id}>{l.title}</option>
              ))}
            </select>
          </Field>

          <Field label="課金タイプ" required>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center justify-between rounded-xl border p-4">
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="billingType"
                    checked={billingType === 'one_time'}
                    onChange={() => setBillingType('one_time')}
                  />
                  <span className="font-medium">30日間</span>
                </span>
                <span className="text-sm text-gray-600">1回払い</span>
              </label>
              <label className="flex cursor-pointer items-center justify-between rounded-xl border p-4">
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="billingType"
                    checked={billingType === 'subscription'}
                    onChange={() => setBillingType('subscription')}
                  />
                  <span className="font-medium">月額サブスク</span>
                </span>
                <span className="text-sm text-gray-600">毎月自動更新</span>
              </label>
            </div>
          </Field>

          <Field label="開始日" required hint="本日以降、1年以内の日付">
            <Input
              type="date"
              required
              min={new Date().toISOString().slice(0, 10)}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Field>

          <div className="space-y-2 border-t pt-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">月額（税抜）</span>
              <span>{priceJpy.toLocaleString('ja-JP')}円</span>
            </div>
            <div className="flex items-center justify-between font-bold">
              <span>お支払い金額（税込）</span>
              <span className="text-lg">{totalJpy.toLocaleString('ja-JP')}円</span>
            </div>
          </div>

          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

          <Button type="submit" size="lg" className="w-full" loading={sending} disabled={!listingId}>
            {totalJpy.toLocaleString('ja-JP')}円を支払う
          </Button>
          <p className="text-xs text-gray-500">
            決済は Stripe の安全な決済ページで行われます。
          </p>
        </form>
      )}
    </div>
  );
}
