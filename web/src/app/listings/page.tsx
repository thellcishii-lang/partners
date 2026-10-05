'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useMasters } from '@/hooks/useMasters';
import { INITIAL_COST_RANGES } from '@/lib/listingFilters';
import { cn } from '@/lib/cn';
import type { Listing } from '@/types';

export default function ListingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { categories, areas, loading: mastersLoading } = useMasters();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // URLクエリからフィルタ状態を読む
  const selectedTarget = searchParams.get('target') ?? '';
  const selectedProduct = searchParams.get('product') ?? '';
  const selectedModel = searchParams.get('model') ?? '';
  const selectedPref = searchParams.get('pref') ?? '';
  const selectedCost = searchParams.get('cost') ?? '';

  // ============================================================
  // フィルタ条件をURLに反映
  // ============================================================
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`/listings?${params.toString()}`, { scroll: false });
  };

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
  // クライアント側でフィルタ
  // ============================================================
  const filtered = useMemo(() => {
    return listings.filter((l) => {
      if (selectedTarget && !l.targetSlugs?.includes(selectedTarget)) return false;
      if (selectedProduct && !l.productSlugs?.includes(selectedProduct)) return false;
      if (selectedModel && !l.modelSlugs?.includes(selectedModel)) return false;
      if (selectedPref && l.prefectureSlug !== selectedPref) return false;
      if (selectedCost && l.initialCostRange !== selectedCost) return false;
      return true;
    });
  }, [listings, selectedTarget, selectedProduct, selectedModel, selectedPref, selectedCost]);

  // マスタの絞り込み
  const targetCategories = categories.filter((c) => c.axis === 'target');
  const productCategories = categories.filter((c) => c.axis === 'product' && !c.parentSlug);
  const modelCategories = categories.filter((c) => c.axis === 'model');
  const prefectures = areas.filter((a) => a.type === 'prefecture');

  const hasFilter = selectedTarget || selectedProduct || selectedModel || selectedPref || selectedCost;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">公開案件一覧</h1>

      {/* ============================================================
          フィルタ
      ============================================================ */}
      {!mastersLoading && (
        <div className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
          <FilterRow label="ターゲット">
            <FilterChip
              active={!selectedTarget}
              onClick={() => updateFilter('target', '')}
            >
              すべて
            </FilterChip>
            {targetCategories.map((c) => (
              <FilterChip
                key={c.slug}
                active={selectedTarget === c.slug}
                onClick={() =>
                  updateFilter('target', selectedTarget === c.slug ? '' : c.slug)
                }
              >
                {c.label}
              </FilterChip>
            ))}
          </FilterRow>

          <FilterRow label="商材">
            <FilterChip
              active={!selectedProduct}
              onClick={() => updateFilter('product', '')}
            >
              すべて
            </FilterChip>
            {productCategories.map((c) => (
              <FilterChip
                key={c.slug}
                active={selectedProduct === c.slug}
                onClick={() =>
                  updateFilter('product', selectedProduct === c.slug ? '' : c.slug)
                }
              >
                {c.label}
              </FilterChip>
            ))}
          </FilterRow>

          <FilterRow label="探し方">
            <FilterChip active={!selectedModel} onClick={() => updateFilter('model', '')}>
              すべて
            </FilterChip>
            {modelCategories.map((c) => (
              <FilterChip
                key={c.slug}
                active={selectedModel === c.slug}
                onClick={() =>
                  updateFilter('model', selectedModel === c.slug ? '' : c.slug)
                }
              >
                {c.label}
              </FilterChip>
            ))}
          </FilterRow>

          <FilterRow label="エリア">
            <select
              aria-label="都道府県"
              className="h-9 rounded-lg border border-gray-300 px-3 text-sm"
              value={selectedPref}
              onChange={(e) => updateFilter('pref', e.target.value)}
            >
              <option value="">すべて</option>
              {prefectures.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.label}
                </option>
              ))}
            </select>
          </FilterRow>

          <FilterRow label="初期費用">
            <FilterChip active={!selectedCost} onClick={() => updateFilter('cost', '')}>
              すべて
            </FilterChip>
            {INITIAL_COST_RANGES.map((r) => (
              <FilterChip
                key={r.slug}
                active={selectedCost === r.slug}
                onClick={() =>
                  updateFilter('cost', selectedCost === r.slug ? '' : r.slug)
                }
              >
                {r.label}
              </FilterChip>
            ))}
          </FilterRow>

          {hasFilter && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => router.replace('/listings')}
                className="text-sm text-brand-700 underline"
              >
                フィルタをクリア
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============================================================
          結果
      ============================================================ */}
      {loading && <p className="text-sm text-gray-500">読み込み中…</p>}
      {error && <p role="alert" className="text-red-600">{error}</p>}

      {!loading && !error && (
        <>
          <p className="text-sm text-gray-600">
            {filtered.length}件の案件
          </p>

          {filtered.length === 0 && (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <p className="text-gray-600">条件に合う案件が見つかりませんでした。</p>
              <p className="mt-2 text-sm text-gray-500">
                条件を変えて再度お試しください。
              </p>
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((listing) => (
              <Link
                key={listing.id}
                href={`/listings/${listing.id}`}
                className="space-y-3 rounded-2xl bg-white p-6 shadow-sm hover:ring-2 hover:ring-brand-500"
              >
                <div className="flex flex-wrap gap-1">
                  {listing.productLabels?.slice(0, 2).map((label) => (
                    <span
                      key={label}
                      className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700"
                    >
                      {label}
                    </span>
                  ))}
                </div>
                <h2 className="text-lg font-bold">{listing.title}</h2>
                <p className="text-sm text-gray-600">会社名：{listing.companyName || '未設定'}</p>
                <p className="text-sm">
                  エリア：{listing.prefectureLabel || listing.area || '応相談'}
                </p>
                <p className="text-sm">
                  初期費用：{listing.initialCostLabel || '応相談'}
                </p>
                <p className="whitespace-pre-wrap text-sm">
                  報酬：{listing.reward || '応相談'}
                </p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1 text-xs transition',
        active
          ? 'border-brand-600 bg-brand-600 text-white'
          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
      )}
    >
      {children}
    </button>
  );
}
