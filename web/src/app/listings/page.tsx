'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useMasters } from '@/hooks/useMasters';
import { INITIAL_COST_RANGES } from '@/lib/listingFilters';
import { cn } from '@/lib/cn';
import type { Listing } from '@/types';

export default function ListingsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">読み込み中…</p>}>
      <ListingsContent />
    </Suspense>
  );
}

type SortKey = 'newest' | 'reward' | 'initialCost';

function ListingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { categories, areas, loading: mastersLoading } = useMasters();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [filterOpen, setFilterOpen] = useState(false);

  // ============================================================
  // URLクエリからフィルタ状態を読む（複数選択対応）
  // ============================================================
  const selectedTargets = useMemo(
    () => searchParams.get('target')?.split(',').filter(Boolean) ?? [],
    [searchParams]
  );
  const selectedProducts = useMemo(
    () => searchParams.get('product')?.split(',').filter(Boolean) ?? [],
    [searchParams]
  );
  const selectedModels = useMemo(
    () => searchParams.get('model')?.split(',').filter(Boolean) ?? [],
    [searchParams]
  );
  const selectedCosts = useMemo(
    () => searchParams.get('cost')?.split(',').filter(Boolean) ?? [],
    [searchParams]
  );
  const selectedPref = searchParams.get('pref') ?? '';

  // ============================================================
  // フィルタ更新（複数選択はカンマ区切り）
  // ============================================================
  const updateMulti = (key: string, current: string[], value: string) => {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    const params = new URLSearchParams(searchParams.toString());
    if (next.length > 0) params.set(key, next.join(','));
    else params.delete(key);
    router.replace(`/listings?${params.toString()}`, { scroll: false });
  };

  const updateSingle = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`/listings?${params.toString()}`, { scroll: false });
  };

  const clearAll = () => router.replace('/listings', { scroll: false });

  // ============================================================
  // 公開案件を取得
  // ============================================================
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getDocs(query(collection(db, 'listings'), where('status', '==', 'published')))
      .then((snap) => {
        if (!active) return;
        setListings(snap.docs.map((item) => ({ ...item.data(), id: item.id } as Listing)));
      })
      .catch((error: unknown) => {
        if (active)
          setError(error instanceof Error ? error.message : '案件一覧の取得に失敗しました。');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // ============================================================
  // フィルタ + ソート
  // ============================================================
  const filtered = useMemo(() => {
    const result = listings.filter((l) => {
      if (
        selectedTargets.length > 0 &&
        !selectedTargets.some((t) => l.targetSlugs?.includes(t))
      )
        return false;
      if (
        selectedProducts.length > 0 &&
        !selectedProducts.some((p) => l.productSlugs?.includes(p))
      )
        return false;
      if (
        selectedModels.length > 0 &&
        !selectedModels.some((m) => l.modelSlugs?.includes(m))
      )
        return false;
      if (selectedPref && l.prefectureSlug !== selectedPref) return false;
      if (
        selectedCosts.length > 0 &&
        !selectedCosts.includes(l.initialCostRange)
      )
        return false;
      return true;
    });

    result.sort((a, b) => {
      if (sortKey === 'newest') {
        const aT = (a.publishedAt as { seconds?: number } | null)?.seconds ?? 0;
        const bT = (b.publishedAt as { seconds?: number } | null)?.seconds ?? 0;
        return bT - aT;
      }
      if (sortKey === 'initialCost') {
        const aC = a.initialCostYen ?? Number.MAX_SAFE_INTEGER;
        const bC = b.initialCostYen ?? Number.MAX_SAFE_INTEGER;
        return aC - bC;
      }
      return 0;
    });

    return result;
  }, [listings, selectedTargets, selectedProducts, selectedModels, selectedCosts, selectedPref, sortKey]);

  // マスタの絞り込み
  const targetCategories = categories.filter((c) => c.axis === 'target');
  const productParents = categories.filter((c) => c.axis === 'product' && !c.parentSlug);
  const productSubs = categories.filter((c) => c.axis === 'product' && c.parentSlug);
  const modelCategories = categories.filter((c) => c.axis === 'model');
  const prefectures = areas.filter((a) => a.type === 'prefecture');

  const hasFilter =
    selectedTargets.length > 0 ||
    selectedProducts.length > 0 ||
    selectedModels.length > 0 ||
    selectedCosts.length > 0 ||
    !!selectedPref;

  return (
    <div className="space-y-4">
      {/* ============================================================
          モバイル：絞り込みボタン
      ============================================================ */}
      <div className="flex items-center justify-between lg:hidden">
        <h1 className="text-lg font-bold">案件を探す</h1>
        <button
          type="button"
          onClick={() => setFilterOpen(!filterOpen)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          {filterOpen ? '絞り込みを閉じる' : `絞り込み${hasFilter ? ' ●' : ''}`}
        </button>
      </div>

      {/* ============================================================
          2カラムレイアウト
      ============================================================ */}
      <div className="flex gap-6">
        {/* ─── 左サイドバー（フィルタ） ─── */}
        <aside
          className={cn(
            'shrink-0 lg:block lg:w-64',
            filterOpen ? 'block w-full' : 'hidden'
          )}
        >
          <div className="space-y-4 lg:sticky lg:top-4">
            <h1 className="hidden text-lg font-bold lg:block">案件を探す</h1>

            {!mastersLoading && (
              <>
                {/* ターゲット */}
                <FilterGroup title="ターゲット">
                  {targetCategories.map((c) => (
                    <CheckRow
                      key={c.slug}
                      checked={selectedTargets.includes(c.slug)}
                      onChange={() => updateMulti('target', selectedTargets, c.slug)}
                    >
                      {c.label}
                    </CheckRow>
                  ))}
                </FilterGroup>

                {/* 商材 */}
                <FilterGroup title="商材">
                  {productParents.map((parent) => {
                    const subs = productSubs.filter((s) => s.parentSlug === parent.slug);
                    return (
                      <div key={parent.slug} className="space-y-1">
                        <CheckRow
                          checked={selectedProducts.includes(parent.slug)}
                          onChange={() => updateMulti('product', selectedProducts, parent.slug)}
                        >
                          <span className="font-medium">{parent.label}</span>
                        </CheckRow>
                        {subs.length > 0 && (
                          <div className="ml-5 space-y-1">
                            {subs.map((sub) => (
                              <CheckRow
                                key={sub.slug}
                                checked={selectedProducts.includes(sub.slug)}
                                onChange={() => updateMulti('product', selectedProducts, sub.slug)}
                              >
                                <span className="text-xs">{sub.label}</span>
                              </CheckRow>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </FilterGroup>

                {/* 探し方 */}
                <FilterGroup title="探し方">
                  {modelCategories.map((c) => (
                    <CheckRow
                      key={c.slug}
                      checked={selectedModels.includes(c.slug)}
                      onChange={() => updateMulti('model', selectedModels, c.slug)}
                    >
                      {c.label}
                    </CheckRow>
                  ))}
                </FilterGroup>

                {/* エリア */}
                <FilterGroup title="エリア">
                  <select
                    aria-label="都道府県"
                    className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm"
                    value={selectedPref}
                    onChange={(e) => updateSingle('pref', e.target.value)}
                  >
                    <option value="">すべて</option>
                    {prefectures.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </FilterGroup>

                {/* 初期費用 */}
                <FilterGroup title="初期費用">
                  {INITIAL_COST_RANGES.map((r) => (
                    <CheckRow
                      key={r.slug}
                      checked={selectedCosts.includes(r.slug)}
                      onChange={() => updateMulti('cost', selectedCosts, r.slug)}
                    >
                      {r.label}
                    </CheckRow>
                  ))}
                </FilterGroup>

                {hasFilter && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="w-full rounded-lg border border-gray-300 bg-white py-2 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    条件をクリア
                  </button>
                )}
              </>
            )}
          </div>
        </aside>

        {/* ─── 右側（結果） ─── */}
        <main className="min-w-0 flex-1">
          {/* 件数と並び替え */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-gray-600">
              {loading ? '読み込み中…' : `${filtered.length}件の案件`}
            </p>
            <select
              aria-label="並び替え"
              className="h-9 rounded-lg border border-gray-300 px-3 text-sm"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
            >
              <option value="newest">新着順</option>
              <option value="initialCost">初期費用が安い順</option>
            </select>
          </div>

          {error && <p role="alert" className="text-red-600">{error}</p>}

          {!loading && !error && (
            <>
              {filtered.length === 0 && (
                <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                  <p className="text-gray-600">条件に合う案件が見つかりませんでした。</p>
                  {hasFilter && (
                    <button
                      type="button"
                      onClick={clearAll}
                      className="mt-3 text-sm text-brand-700 underline"
                    >
                      条件をクリア
                    </button>
                  )}
                </div>
              )}

              <div className="space-y-3">
                {filtered.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// ============================================================
// 案件カード（リスト形式）
// ============================================================
function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="block rounded-2xl bg-white p-5 shadow-sm transition hover:ring-2 hover:ring-brand-500"
    >
      {/* タグ */}
      <div className="flex flex-wrap gap-1">
        {listing.productLabels?.slice(0, 2).map((label) => (
          <span
            key={label}
            className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700"
          >
            {label}
          </span>
        ))}
        {listing.targetLabels?.slice(0, 1).map((label) => (
          <span
            key={label}
            className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
          >
            {label}
          </span>
        ))}
        {listing.modelLabels?.slice(0, 1).map((label) => (
          <span
            key={label}
            className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700"
          >
            {label}
          </span>
        ))}
      </div>

      {/* タイトル・会社名 */}
      <h2 className="mt-2 text-lg font-bold">{listing.title}</h2>
      <p className="text-sm text-gray-600">{listing.companyName || '会社名未設定'}</p>

      {/* 情報行 */}
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-700">
        <span>📍 {listing.prefectureLabel || listing.area || '全国'}</span>
        <span>💰 {listing.initialCostLabel || '応相談'}</span>
        {listing.expectedRevenueLabel && listing.expectedRevenueLabel !== '応相談' && (
          <span>🎯 {listing.expectedRevenueLabel}</span>
        )}
      </div>

      {/* 報酬 */}
      <p className="mt-2 text-sm font-medium text-gray-900">
        報酬：{listing.reward || '応相談'}
      </p>
    </Link>
  );
}

// ============================================================
// フィルタUI部品
// ============================================================
function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="mb-2 text-xs font-bold text-gray-700">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function CheckRow({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm hover:bg-gray-50">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span>{children}</span>
    </label>
  );
}
