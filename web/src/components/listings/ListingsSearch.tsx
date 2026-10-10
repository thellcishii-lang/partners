'use client';

import { Suspense, useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { collection, getDocs, query, where } from 'firebase/firestore';
import {
  Wallet,
  Coins,
  Package,
  TrendingUp,
  LineChart,
  Repeat,
  Users,
  MapPin,
  type LucideIcon,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { useMasters } from '@/hooks/useMasters';
import {
  INITIAL_COST_RANGES,
  FRANCHISE_FEE_RANGES,
  STOCK_TYPES,
  REVENUE_AMOUNTS,
  PROFIT_AMOUNTS,
  REVENUE_TYPES,
  ORGANIZATION_TYPES,
  REGION_LABELS,
  REGION_SLUGS,
} from '@/lib/listingFilters';
import { cn } from '@/lib/cn';
import type { Listing } from '@/types';

export function ListingsSearch() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">読み込み中…</p>}>
      <SearchContent />
    </Suspense>
  );
}

type SortKey = 'newest' | 'initialCost';

type TopFilterKey =
  | 'fee'
  | 'initial'
  | 'stock'
  | 'revenue'
  | 'profit'
  | 'revenueType'
  | 'org'
  | 'area';

const TOP_FILTERS: { key: TopFilterKey; label: string; options: { slug: string; label: string }[] }[] = [
  { key: 'fee',         label: '加盟金',       options: [...FRANCHISE_FEE_RANGES] },
  { key: 'initial',     label: '初期費用',     options: [...INITIAL_COST_RANGES] },
  { key: 'stock',       label: '仕入れ',       options: [...STOCK_TYPES] },
  { key: 'revenue',     label: '売上推定',     options: [...REVENUE_AMOUNTS] },
  { key: 'profit',      label: '利益推定',     options: [...PROFIT_AMOUNTS] },
  { key: 'revenueType', label: '収益タイプ',   options: [...REVENUE_TYPES] },
  { key: 'org',         label: '組織拡大',     options: [...ORGANIZATION_TYPES] },
  { key: 'area',        label: '対応エリア',   options: [] },
];

const FILTER_ICONS: Record<TopFilterKey, LucideIcon> = {
  fee: Wallet,
  initial: Coins,
  stock: Package,
  revenue: TrendingUp,
  profit: LineChart,
  revenueType: Repeat,
  org: Users,
  area: MapPin,
};

const REGION_GROUP_LABELS: Record<string, string> = {
  hokkaido: '北海道',
  tohoku: '東北',
  kanto: '関東',
  chubu: '中部',
  kansai: '関西',
  chugoku: '中国',
  shikoku: '四国',
  kyushu: '九州・沖縄',
};

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { categories, areas, loading: mastersLoading } = useMasters();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [filterOpen, setFilterOpen] = useState(false);
  const [openTopFilter, setOpenTopFilter] = useState<TopFilterKey | null>(null);
  const [keywordInput, setKeywordInput] = useState(searchParams.get('q') ?? '');

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
  const selectedArea = searchParams.get('area') ?? '';
  const keyword = searchParams.get('q') ?? '';

  const selectedFee = searchParams.get('fee') ?? '';
  const selectedStock = searchParams.get('stock') ?? '';
  const selectedRevenue = searchParams.get('revenue') ?? '';
  const selectedProfit = searchParams.get('profit') ?? '';
  const selectedRevenueType = searchParams.get('revenueType') ?? '';
  const selectedOrg = searchParams.get('org') ?? '';

  useEffect(() => {
    setKeywordInput(searchParams.get('q') ?? '');
  }, [searchParams]);

  const updateMulti = (key: string, current: string[], value: string) => {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    const params = new URLSearchParams(searchParams.toString());
    if (next.length > 0) params.set(key, next.join(','));
    else params.delete(key);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const updateSingle = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const clearAll = () => {
    setKeywordInput('');
    setOpenTopFilter(null);
    router.replace('?', { scroll: false });
  };

  const submitKeyword = (e: FormEvent) => {
    e.preventDefault();
    updateSingle('q', keywordInput.trim());
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getDocs(query(collection(db, 'listings'), where('status', '==', 'published')))
      .then((snap) => {
        if (!active) return;
        setListings(snap.docs.map((item) => ({ ...item.data(), id: item.id } as Listing)));
      })
      .catch((err: unknown) => {
        if (active)
          setError(err instanceof Error ? err.message : '案件一覧の取得に失敗しました。');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const kw = keyword.toLowerCase().trim();
    const result = listings.filter((l) => {
      if (kw && !(l.searchText ?? '').toLowerCase().includes(kw)) return false;
      if (selectedTargets.length > 0 && !selectedTargets.some((t) => l.targetSlugs?.includes(t))) return false;
      if (selectedProducts.length > 0 && !selectedProducts.some((p) => l.productSlugs?.includes(p))) return false;
      if (selectedModels.length > 0 && !selectedModels.some((m) => l.modelSlugs?.includes(m))) return false;

      // エリア
      if (selectedArea) {
        if (selectedArea === 'all') {
          if (l.areaMode !== 'nationwide') return false;
        } else if (REGION_SLUGS.includes(selectedArea as typeof REGION_SLUGS[number])) {
          if (!l.areaSearchRegionSlugs?.includes(selectedArea)) return false;
        } else {
          if (!l.areaSearchPrefectureSlugs?.includes(selectedArea)) return false;
        }
      }

      if (selectedCosts.length > 0 && !selectedCosts.includes(l.initialCostRange)) return false;
      if (selectedFee && l.franchiseFeeRange !== selectedFee) return false;
      if (selectedStock && l.stockType !== selectedStock) return false;
      if (selectedRevenue && l.expectedRevenueRange !== selectedRevenue) return false;
      if (selectedProfit && l.expectedProfitRange !== selectedProfit) return false;
      if (selectedRevenueType && l.revenueType !== selectedRevenueType) return false;
      if (selectedOrg && !l.organizationTypes?.includes(selectedOrg)) return false;
      return true;
    });
    result.sort((a, b) => {
      if (sortKey === 'initialCost') {
        const aC = a.initialCostYen ?? Number.MAX_SAFE_INTEGER;
        const bC = b.initialCostYen ?? Number.MAX_SAFE_INTEGER;
        return aC - bC;
      }
      const aT = (a.publishedAt as { seconds?: number } | null)?.seconds ?? 0;
      const bT = (b.publishedAt as { seconds?: number } | null)?.seconds ?? 0;
      return bT - aT;
    });
    return result;
  }, [listings, keyword, selectedTargets, selectedProducts, selectedModels, selectedCosts,
      selectedArea, selectedFee, selectedStock, selectedRevenue, selectedProfit,
      selectedRevenueType, selectedOrg, sortKey]);

  const targetCategories = categories.filter((c) => c.axis === 'target');
  const productParents = categories.filter((c) => c.axis === 'product' && !c.parentSlug);
  const productSubs = categories.filter((c) => c.axis === 'product' && c.parentSlug);
  const modelCategories = categories.filter((c) => c.axis === 'model');
  const prefectures = areas.filter((a) => a.type === 'prefecture');

  const hasFilter =
    !!keyword ||
    selectedTargets.length > 0 ||
    selectedProducts.length > 0 ||
    selectedModels.length > 0 ||
    selectedCosts.length > 0 ||
    !!selectedArea ||
    !!selectedFee ||
    !!selectedStock ||
    !!selectedRevenue ||
    !!selectedProfit ||
    !!selectedRevenueType ||
    !!selectedOrg;

  const getTopValue = (key: TopFilterKey): string => {
    switch (key) {
      case 'fee': return selectedFee;
      case 'initial': return selectedCosts[0] ?? '';
      case 'stock': return selectedStock;
      case 'revenue': return selectedRevenue;
      case 'profit': return selectedProfit;
      case 'revenueType': return selectedRevenueType;
      case 'org': return selectedOrg;
      case 'area': return selectedArea;
      default: return '';
    }
  };

  const getTopLabel = (key: TopFilterKey): string | null => {
    const value = getTopValue(key);
    if (!value) return null;
    if (key === 'area') {
      if (value === 'all') return '全国';
      if (REGION_SLUGS.includes(value as typeof REGION_SLUGS[number])) {
        return REGION_LABELS[value] ?? value;
      }
      return prefectures.find((p) => p.slug === value)?.label ?? null;
    }
    const filter = TOP_FILTERS.find((f) => f.key === key);
    return filter?.options.find((o) => o.slug === value)?.label ?? null;
  };

  const setTopValue = (key: TopFilterKey, value: string) => {
    switch (key) {
      case 'fee': updateSingle('fee', value); break;
      case 'initial': updateSingle('cost', value); break;
      case 'stock': updateSingle('stock', value); break;
      case 'revenue': updateSingle('revenue', value); break;
      case 'profit': updateSingle('profit', value); break;
      case 'revenueType': updateSingle('revenueType', value); break;
      case 'org': updateSingle('org', value); break;
      case 'area': updateSingle('area', value); break;
    }
    setOpenTopFilter(null);
  };

  return (
    <div className="space-y-4">

      {/* 上部タイル */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TOP_FILTERS.map((f) => {
            const label = getTopLabel(f.key);
            const Icon = FILTER_ICONS[f.key];
            const isOpen = openTopFilter === f.key;
            const isActive = !!label;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setOpenTopFilter(isOpen ? null : f.key)}
                className={cn(
                  'flex items-start gap-3 rounded-xl border-2 p-3.5 text-left transition',
                  isActive
                    ? 'border-emerald-500 bg-gradient-to-b from-emerald-50 to-emerald-100 shadow-sm'
                    : 'border-emerald-100 bg-gradient-to-b from-emerald-50/60 to-emerald-50 hover:border-emerald-300',
                  isOpen && 'ring-2 ring-emerald-400',
                )}
              >
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                    isActive ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-700',
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold tracking-wide text-emerald-700">
                    {f.label}
                  </p>
                  <p
                    className={cn(
                      'mt-0.5 truncate text-sm font-bold',
                      isActive ? 'text-gray-900' : 'text-gray-400',
                    )}
                  >
                    {label ?? '未選択'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* 展開中の選択肢 */}
        {openTopFilter && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold text-emerald-700">
                {TOP_FILTERS.find((f) => f.key === openTopFilter)?.label}
              </p>
              <button
                type="button"
                onClick={() => setTopValue(openTopFilter, '')}
                className="text-xs text-gray-500 underline hover:no-underline"
              >
                すべて
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {openTopFilter === 'area' ? (
                <select
                  className="h-9 w-full max-w-xs rounded-lg border border-gray-300 px-3 text-sm"
                  value={selectedArea}
                  onChange={(e) => setTopValue('area', e.target.value)}
                >
                  <option value="">すべて</option>
                  <option value="all">全国</option>
                  <optgroup label="地域">
                    {REGION_SLUGS.map((slug) => (
                      <option key={slug} value={slug}>{REGION_LABELS[slug]}</option>
                    ))}
                  </optgroup>
                  <optgroup label="都道府県">
                    {prefectures.map((p) => (
                      <option key={p.slug} value={p.slug}>{p.label}</option>
                    ))}
                  </optgroup>
                </select>
              ) : (
                TOP_FILTERS.find((f) => f.key === openTopFilter)?.options.map((o) => {
                  const isSelected = getTopValue(openTopFilter) === o.slug;
                  return (
                    <button
                      key={o.slug}
                      type="button"
                      onClick={() => setTopValue(openTopFilter, isSelected ? '' : o.slug)}
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs transition',
                        isSelected
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-emerald-500',
                      )}
                    >
                      {o.label}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => router.refresh()}
            className="rounded-lg bg-emerald-600 px-8 py-3 text-sm font-bold text-white hover:bg-emerald-700"
          >
            この条件で検索
          </button>
          {hasFilter && (
            <button
              type="button"
              onClick={clearAll}
              className="text-sm text-gray-500 underline hover:no-underline"
            >
              条件をクリア
            </button>
          )}
          <span className="ml-auto text-sm text-gray-600">
            {loading ? '読み込み中…' : `${filtered.length}件`}
          </span>
        </div>
      </div>

      {/* モバイル：絞り込みボタン */}
      <div className="flex items-center justify-between lg:hidden">
        <p className="text-sm text-gray-600">
          {loading ? '読み込み中…' : `${filtered.length}件の案件`}
        </p>
        <button
          type="button"
          onClick={() => setFilterOpen(!filterOpen)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          {filterOpen ? '閉じる' : `さらに絞り込む${hasFilter ? ' ●' : ''}`}
        </button>
      </div>

      <div className="flex gap-6">
        {/* 左サイドバー */}
        <aside
          className={cn(
            'shrink-0 lg:block lg:w-64',
            filterOpen ? 'block w-full' : 'hidden'
          )}
        >
          <div className="space-y-4 lg:sticky lg:top-4">
            {/* キーワード */}
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <p className="mb-2 text-xs font-bold text-gray-700">キーワード</p>
              <form onSubmit={submitKeyword} className="flex gap-1">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder="例：AI、東京"
                  className="h-9 min-w-0 flex-1 rounded-lg border border-gray-300 px-3 text-sm"
                />
                <button
                  type="submit"
                  className="h-9 rounded-lg bg-emerald-600 px-3 text-xs text-white hover:bg-emerald-700"
                >
                  検索
                </button>
              </form>
            </div>

            {!mastersLoading && (
              <>
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

                <FilterGroup title="仕入れ">
                  {STOCK_TYPES.map((t) => (
                    <RadioRow
                      key={t.slug}
                      name="stock"
                      checked={selectedStock === t.slug}
                      onChange={() => updateSingle('stock', selectedStock === t.slug ? '' : t.slug)}
                    >
                      {t.label}
                    </RadioRow>
                  ))}
                </FilterGroup>

                <FilterGroup title="利益推定">
                  {PROFIT_AMOUNTS.map((p) => (
                    <RadioRow
                      key={p.slug}
                      name="profit"
                      checked={selectedProfit === p.slug}
                      onChange={() => updateSingle('profit', selectedProfit === p.slug ? '' : p.slug)}
                    >
                      {p.label}
                    </RadioRow>
                  ))}
                </FilterGroup>

                <FilterGroup title="収益タイプ">
                  {REVENUE_TYPES.map((t) => (
                    <RadioRow
                      key={t.slug}
                      name="revenueType"
                      checked={selectedRevenueType === t.slug}
                      onChange={() => updateSingle('revenueType', selectedRevenueType === t.slug ? '' : t.slug)}
                    >
                      {t.label}
                    </RadioRow>
                  ))}
                </FilterGroup>

                <FilterGroup title="組織拡大">
                  {ORGANIZATION_TYPES.map((t) => (
                    <RadioRow
                      key={t.slug}
                      name="org"
                      checked={selectedOrg === t.slug}
                      onChange={() => updateSingle('org', selectedOrg === t.slug ? '' : t.slug)}
                    >
                      {t.label}
                    </RadioRow>
                  ))}
                </FilterGroup>

                <FilterGroup title="エリア">
                  <select
                    aria-label="エリア"
                    className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm"
                    value={selectedArea}
                    onChange={(e) => updateSingle('area', e.target.value)}
                  >
                    <option value="">すべて</option>
                    <option value="all">全国</option>
                    <optgroup label="地域">
                      {REGION_SLUGS.map((slug) => (
                        <option key={slug} value={slug}>{REGION_LABELS[slug]}</option>
                      ))}
                    </optgroup>
                    <optgroup label="都道府県">
                      {prefectures.map((p) => (
                        <option key={p.slug} value={p.slug}>
                          {p.label}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </FilterGroup>

                <FilterGroup title="初期費用">
                  {INITIAL_COST_RANGES.map((r) => (
                    <RadioRow
                      key={r.slug}
                      name="cost"
                      checked={selectedCosts.includes(r.slug)}
                      onChange={() => updateMulti('cost', selectedCosts, r.slug)}
                    >
                      {r.label}
                    </RadioRow>
                  ))}
                </FilterGroup>

                <FilterGroup title="加盟金">
                  {FRANCHISE_FEE_RANGES.map((r) => (
                    <RadioRow
                      key={r.slug}
                      name="fee"
                      checked={selectedFee === r.slug}
                      onChange={() => updateSingle('fee', selectedFee === r.slug ? '' : r.slug)}
                    >
                      {r.label}
                    </RadioRow>
                  ))}
                </FilterGroup>

                <FilterGroup title="売上推定">
                  {REVENUE_AMOUNTS.map((p) => (
                    <RadioRow
                      key={p.slug}
                      name="revenue"
                      checked={selectedRevenue === p.slug}
                      onChange={() => updateSingle('revenue', selectedRevenue === p.slug ? '' : p.slug)}
                    >
                      {p.label}
                    </RadioRow>
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

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs text-gray-700">
                代理店・加盟店を募集したい企業の方
              </p>
              <Link
                href="/signup"
                className="mt-2 block rounded-lg bg-emerald-600 px-3 py-2 text-center text-xs font-medium text-white hover:bg-emerald-700"
              >
                掲載についてはこちら
              </Link>
            </div>
          </div>
        </aside>

        {/* 右（結果） */}
        <main className="min-w-0 flex-1">
          <div className="mb-4 hidden flex-wrap items-center justify-between gap-2 lg:flex">
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
                  <p className="mt-2 text-sm text-gray-500">
                    条件を減らして再度お試しください。
                  </p>
                  {hasFilter && (
                    <button
                      type="button"
                      onClick={clearAll}
                      className="mt-3 text-sm text-emerald-700 underline"
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

function ListingCard({ listing }: { listing: Listing }) {
  const areaText = listing.areaLabels?.length
    ? listing.areaLabels.slice(0, 2).join('・')
    : '全国';
  const mainImage = listing.images?.[0];

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="block rounded-2xl bg-white shadow-sm transition hover:shadow-md hover:ring-2 hover:ring-emerald-500"
    >
      <div className="flex gap-5 p-5">
        {/* 左：メイン画像 */}
        <div className="aspect-video w-64 shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:w-80">
          {mainImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={mainImage}
              alt={listing.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-14 w-14">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
          )}
        </div>

        {/* 右：情報 */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* タグ行 */}
          <div className="mb-2 flex flex-wrap gap-1.5">
            {listing.targetLabels?.slice(0, 2).map((label) => (
              <span
                key={label}
                className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-700"
              >
                {label}
              </span>
            ))}
            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
              {areaText}
            </span>
            {listing.productLabels?.slice(0, 2).map((label) => (
              <span
                key={label}
                className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700"
              >
                {label}
              </span>
            ))}
            {listing.modelLabels?.slice(0, 1).map((label) => (
              <span
                key={label}
                className="rounded-md bg-green-50 px-2 py-0.5 text-[11px] font-bold text-green-700"
              >
                {label}
              </span>
            ))}
          </div>

          {/* タイトル */}
          <h2 className="line-clamp-2 text-lg font-bold leading-snug text-gray-900">
            {listing.title}
          </h2>

          {/* 掲載企業 */}
          <p className="mt-1 text-xs text-gray-500">
            掲載企業：{listing.companyName || '未設定'}
          </p>

          {/* 説明 */}
          {listing.description && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600">
              {listing.description}
            </p>
          )}

          {/* 下部：条件 */}
          <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-3 text-xs text-gray-600">
            {listing.initialCostLabel && (
              <span>💵 初期費用：{listing.initialCostLabel}</span>
            )}
            {listing.franchiseFeeLabel && (
              <span>💰 加盟金：{listing.franchiseFeeLabel}</span>
            )}
            {listing.revenueTypeLabel && (
              <span>📈 {listing.revenueTypeLabel}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
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

function RadioRow({
  name,
  checked,
  onChange,
  children,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm hover:bg-gray-50">
      <input type="radio" name={name} checked={checked} onChange={onChange} />
      <span>{children}</span>
    </label>
  );
}
