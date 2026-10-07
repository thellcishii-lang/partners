'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Input';
import { useMasters } from '@/hooks/useMasters';
import { ImageUploader } from './ImageUploader';
import { ListingDetail } from './ListingDetail';
import {
  buildSearchText,
  getInitialCostLabel,
  getInitialCostRange,
  getExpectedRevenueLabel,
  getExpectedRevenueRange,
  getRegionSlug,
  getRegionLabel,
  getFranchiseFeeRange,
  getFranchiseFeeLabel,
  getStockLabel,
  getProfitAmountRange,
  getProfitAmountLabel,
  getRevenueTypeLabel,
  getOrganizationTypeLabel,
  STOCK_TYPES,
  REVENUE_TYPES,
  ORGANIZATION_TYPES,
} from '@/lib/listingFilters';
import {
  LISTING_CATEGORIES,
  type Advertiser,
  type Listing,
  type ListingCategory,
  type ListingStatus,
} from '@/types';
import { cn } from '@/lib/cn';

export function ListingForm({
  advertiser,
  listing,
}: {
  advertiser: Advertiser;
  listing?: Listing;
}) {
  const router = useRouter();
  const { categories, areas, loading: mastersLoading } = useMasters();

  // 基本情報
  const [title, setTitle] = useState(listing?.title ?? '');
  const [category, setCategory] = useState<ListingCategory>(listing?.category ?? '代理店');
  const [description, setDescription] = useState(listing?.description ?? '');

  // 3軸
  const [targetSlugs, setTargetSlugs] = useState<string[]>(listing?.targetSlugs ?? []);
  const [productSlugs, setProductSlugs] = useState<string[]>(listing?.productSlugs ?? []);
  const [modelSlugs, setModelSlugs] = useState<string[]>(listing?.modelSlugs ?? []);

  // 地域
  const [prefectureSlug, setPrefectureSlug] = useState(listing?.prefectureSlug ?? '');

  // 初期費用
  type CostMode = 'free' | 'amount' | 'unknown';
  const [initialCostMode, setInitialCostMode] = useState<CostMode>(
    listing?.initialCostRange === 'initial-free' ? 'free'
      : listing?.initialCostRange === 'initial-unknown' || !listing ? 'unknown'
        : 'amount'
  );
  const [initialCostAmount, setInitialCostAmount] = useState<string>(
    listing?.initialCostYen ? String(listing.initialCostYen) : ''
  );

  // 想定年商
  type RevenueMode = 'amount' | 'unknown';
  const [revenueMode, setRevenueMode] = useState<RevenueMode>(
    listing?.expectedRevenueRange === 'revenue-unknown' || !listing ? 'unknown' : 'amount'
  );
  const [revenueAmount, setRevenueAmount] = useState<string>(
    listing?.expectedRevenueYen ? String(listing.expectedRevenueYen) : ''
  );

  // 加盟金
  type FeeMode = 'amount' | 'unknown';
  const [franchiseFeeMode, setFranchiseFeeMode] = useState<FeeMode>(
    listing?.franchiseFeeYen != null ? 'amount' : 'unknown'
  );
  const [franchiseFeeAmount, setFranchiseFeeAmount] = useState<string>(
    listing?.franchiseFeeYen != null ? String(listing.franchiseFeeYen) : ''
  );

  // 仕入れ
  const [stockType, setStockType] = useState(listing?.stockType ?? '');

  // 想定月商
  type ProfitMode = 'amount' | 'unknown';
  const [profitMode, setProfitMode] = useState<ProfitMode>(
    listing?.expectedProfitYen != null ? 'amount' : 'unknown'
  );
  const [profitAmount, setProfitAmount] = useState<string>(
    listing?.expectedProfitYen != null ? String(listing.expectedProfitYen) : ''
  );

  // 収益タイプ / 組織拡大
  const [revenueType, setRevenueType] = useState(listing?.revenueType ?? '');
  const [organizationType, setOrganizationType] = useState(listing?.organizationType ?? '');

  // その他
  const [fields, setFields] = useState({
    requirements: listing?.requirements ?? '',
    reward: listing?.reward ?? '',
    initialCost: listing?.initialCost ?? '',
    royalty: listing?.royalty ?? '',
    area: listing?.area ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  // 画像（最大6枚）
  const [images, setImages] = useState<string[]>(listing?.images ?? []);

  // 会社情報（詳細ページのサイドバー）
  const [companyInfo, setCompanyInfo] = useState({
    companyAddress: listing?.companyAddress ?? '',
    companyRepresentative: listing?.companyRepresentative ?? '',
    companyEstablished: listing?.companyEstablished ?? '',
    companyBusiness: listing?.companyBusiness ?? '',
  });

  // こんな方におすすめ（最大5個）
  const [recommendedFor, setRecommendedFor] = useState<string[]>(
    listing?.recommendedFor ?? ['']
  );

  // ビジネスの説明（固定5個）
  const [businessPoints, setBusinessPoints] = useState<
    { title: string; body: string }[]
  >(() => {
    const existing = listing?.businessPoints ?? [];
    return Array.from({ length: 5 }, (_, i) => existing[i] ?? { title: '', body: '' });
  });

  // 詳細情報（サイドバー）
  const [detailInfo, setDetailInfo] = useState({
    salesTarget: listing?.salesTarget ?? '',
    salesMethod: listing?.salesMethod ?? '',
    earnings: listing?.earnings ?? '',
  });
  const [agentFit, setAgentFit] = useState<string[]>(
    listing?.agentFit ?? ['']
  );

  // ============================================================
  // マスタの絞り込み
  // ============================================================
  const targetCategories = categories.filter((c) => c.axis === 'target');
  const productParents = categories.filter((c) => c.axis === 'product' && !c.parentSlug);
  const productSubs = categories.filter((c) => c.axis === 'product' && c.parentSlug);
  const modelCategories = categories.filter((c) => c.axis === 'model');
  const prefectures = areas.filter((a) => a.type === 'prefecture');

  const toggle = (list: string[], setList: (v: string[]) => void, slug: string) => {
    setList(list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug]);
  };

  // 大分類を切り替えたら、そのサブも一緒に外す
  const toggleProductParent = (parentSlug: string) => {
    if (productSlugs.includes(parentSlug)) {
      const subs = productSubs.filter((s) => s.parentSlug === parentSlug).map((s) => s.slug);
      setProductSlugs(productSlugs.filter((s) => s !== parentSlug && !subs.includes(s)));
    } else {
      setProductSlugs([...productSlugs, parentSlug]);
    }
  };

  const toggleProductSub = (subSlug: string, parentSlug: string) => {
    if (productSlugs.includes(subSlug)) {
      setProductSlugs(productSlugs.filter((s) => s !== subSlug));
    } else {
      const next = new Set([...productSlugs, subSlug, parentSlug]);
      setProductSlugs([...next]);
    }
  };

  // ============================================================
  // フィルタ用のdenormalize（保存とプレビューで共通）
  // ============================================================
  const buildFilterData = () => {
    const targetLabels = targetSlugs
      .map((s) => categories.find((c) => c.slug === s)?.label ?? '')
      .filter(Boolean);
    const productLabels = productSlugs
      .map((s) => categories.find((c) => c.slug === s)?.label ?? '')
      .filter(Boolean);
    const modelLabels = modelSlugs
      .map((s) => categories.find((c) => c.slug === s)?.label ?? '')
      .filter(Boolean);

    const pref = areas.find((a) => a.slug === prefectureSlug);
    const prefectureLabel = pref?.label ?? '';
    const regionSlug = getRegionSlug(prefectureSlug);
    const regionLabel = getRegionLabel(prefectureSlug);

    const initialCostYen =
      initialCostMode === 'free' ? 0
        : initialCostMode === 'unknown' ? null
          : Number(initialCostAmount) || null;
    const initialCostRange = getInitialCostRange(initialCostYen);
    const initialCostLabel = getInitialCostLabel(initialCostRange);

    const expectedRevenueYen =
      revenueMode === 'unknown' ? null : Number(revenueAmount) || null;
    const expectedRevenueRange = getExpectedRevenueRange(expectedRevenueYen);
    const expectedRevenueLabel = getExpectedRevenueLabel(expectedRevenueRange);

    const franchiseFeeYen =
      franchiseFeeMode === 'unknown' ? null : Number(franchiseFeeAmount) || null;
    const franchiseFeeRange = getFranchiseFeeRange(franchiseFeeYen);
    const franchiseFeeLabel = getFranchiseFeeLabel(franchiseFeeYen);

    const expectedProfitYen =
      profitMode === 'unknown' ? null : Number(profitAmount) || null;
    const expectedProfitRange = getProfitAmountRange(expectedProfitYen);
    const expectedProfitLabel = getProfitAmountLabel(expectedProfitYen);

    const searchText = buildSearchText({
      title: title.trim(),
      description: description.trim(),
      targetLabels,
      productLabels,
      modelLabels,
      prefectureLabel,
      regionLabel,
      category,
      companyName: advertiser.companyName,
    });

    return {
            title: title.trim(),
      category,
      description: description.trim(),
      requirements: fields.requirements.trim(),
      reward: fields.reward.trim(),
      initialCost: fields.initialCost.trim(),
      royalty: fields.royalty.trim(),
      area: fields.area.trim(),
      companyName: advertiser.companyName,

      targetSlugs,
      targetLabels,
      productSlugs,
      productLabels,
      modelSlugs,
      modelLabels,

      prefectureSlug,
      prefectureLabel,
      regionSlug,
      regionLabel,

      initialCostYen,
      initialCostRange,
      initialCostLabel,

      expectedRevenueYen,
      expectedRevenueRange,
      expectedRevenueLabel,

      franchiseFeeYen,
      franchiseFeeRange,
      franchiseFeeLabel,

      stockType,
      stockLabel: getStockLabel(stockType),

      expectedProfitYen,
      expectedProfitRange,
      expectedProfitLabel,

      revenueType,
      revenueTypeLabel: getRevenueTypeLabel(revenueType),

      organizationType,
      organizationTypeLabel: getOrganizationTypeLabel(organizationType),

      searchText,
      images,

      ...companyInfo,

      recommendedFor: recommendedFor.map((v) => v.trim()).filter(Boolean),

      businessPoints: businessPoints
        .map((p) => ({ title: p.title.trim(), body: p.body.trim() }))
        .filter((p) => p.title || p.body),

      ...detailInfo,
      agentFit: agentFit.map((v) => v.trim()).filter(Boolean),
    };
  };

  // ============================================================
  // プレビュー用オブジェクト（毎レンダー再計算）
  // ============================================================
  const previewListing: Listing = {
    id: listing?.id ?? 'preview',
    advertiserId: advertiser.uid,
    ...buildFilterData(),
    status: listing?.status ?? 'draft',
    publishedAt: listing?.publishedAt ?? null,
    createdAt: listing?.createdAt,
    updatedAt: listing?.updatedAt,
  };

  // ============================================================
  // 保存
  // ============================================================
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const status: ListingStatus =
      submitter instanceof HTMLButtonElement && submitter.value === 'reviewing'
        ? 'reviewing'
        : 'draft';

    if (!title.trim() || title.trim().length > 120 || !description.trim()) {
      setError('タイトルは1〜120字、募集内容は必須です。');
      return;
    }
    if (targetSlugs.length === 0) {
      setError('ターゲットを1つ以上選択してください。');
      return;
    }
    if (productSlugs.length === 0) {
      setError('商材を1つ以上選択してください。');
      return;
    }
    if (!prefectureSlug) {
      setError('都道府県を選択してください。');
      return;
    }
    if (!advertiser.companyName?.trim()) {
      setError('募集者プロフィールに会社名を登録してから案件を保存してください。');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const data = {
        ...buildFilterData(),
        status,
        updatedAt: serverTimestamp(),
      };

      if (listing) {
        await updateDoc(doc(db, 'listings', listing.id), data);
      } else {
        await addDoc(collection(db, 'listings'), {
          ...data,
          advertiserId: advertiser.uid,
          publishedAt: null,
          createdAt: serverTimestamp(),
        });
      }
      router.push('/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : '案件の保存に失敗しました。');
      setSaving(false);
    }
  };

  if (mastersLoading) {
    return <p className="text-center text-sm text-gray-500">マスタを読み込み中…</p>;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)]">
      {/* ============================================================
          左カラム：入力フォーム
      ============================================================ */}
      <form onSubmit={save} className="space-y-6">
        {/* 基本情報 */}
        <section className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-bold">基本情報</h2>
          <Field label="案件タイトル" required>
            <Input
              aria-label="案件タイトル"
              required
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
          <Field label="種別" required>
            <select
              aria-label="種別"
              className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm"
              value={category}
              onChange={(e) => {
                const value = LISTING_CATEGORIES.find((item) => item === e.target.value);
                if (value) setCategory(value);
              }}
            >
              {LISTING_CATEGORIES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>
          <Field label="募集内容" required>
            <Textarea
              aria-label="募集内容"
              required
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
        </section>

        {/* 画像 */}
        <section className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-bold">画像</h2>
          <p className="text-xs text-gray-500">
            案件詳細ページのトップに表示されます。1枚目がメイン画像になります。
          </p>
          <ImageUploader
            advertiserId={advertiser.uid}
            images={images}
            onChange={setImages}
            maxImages={6}
          />
        </section>

        {/* ターゲット */}
        <section className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-bold">
            ターゲット（誰向けか）<span className="ml-2 text-xs text-red-500">必須</span>
          </h2>
          <p className="text-xs text-gray-500">複数選択できます。</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {targetCategories.map((c) => (
              <label
                key={c.slug}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm',
                  targetSlugs.includes(c.slug) ? 'border-brand-600 bg-brand-50' : 'border-gray-200'
                )}
              >
                <input
                  type="checkbox"
                  checked={targetSlugs.includes(c.slug)}
                  onChange={() => toggle(targetSlugs, setTargetSlugs, c.slug)}
                />
                {c.label}
              </label>
            ))}
          </div>
        </section>

        {/* 商材 */}
        <section className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-bold">
            商材（何を扱うか）<span className="ml-2 text-xs text-red-500">必須</span>
          </h2>
          <p className="text-xs text-gray-500">大分類を選ぶと、そのサブカテゴリも表示されます。</p>
          <div className="space-y-3">
            {productParents.map((parent) => {
              const subs = productSubs.filter((s) => s.parentSlug === parent.slug);
              const isParentSelected = productSlugs.includes(parent.slug);
              return (
                <div key={parent.slug} className="rounded-lg border border-gray-200 p-3">
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={isParentSelected}
                      onChange={() => toggleProductParent(parent.slug)}
                    />
                    {parent.label}
                  </label>
                  {subs.length > 0 && (
                    <div className="mt-2 ml-6 flex flex-wrap gap-2">
                      {subs.map((sub) => (
                        <label
                          key={sub.slug}
                          className={cn(
                            'flex cursor-pointer items-center gap-1 rounded border px-2 py-1 text-xs',
                            productSlugs.includes(sub.slug) ? 'border-brand-600 bg-brand-50' : 'border-gray-200'
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={productSlugs.includes(sub.slug)}
                            onChange={() => toggleProductSub(sub.slug, parent.slug)}
                          />
                          {sub.label}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ビジネスモデル */}
        <section className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-bold">ビジネスモデル / 探し方</h2>
          <p className="text-xs text-gray-500">該当するものを複数選択できます。</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {modelCategories.map((c) => (
              <label
                key={c.slug}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm',
                  modelSlugs.includes(c.slug) ? 'border-brand-600 bg-brand-50' : 'border-gray-200'
                )}
              >
                <input
                  type="checkbox"
                  checked={modelSlugs.includes(c.slug)}
                  onChange={() => toggle(modelSlugs, setModelSlugs, c.slug)}
                />
                {c.label}
              </label>
            ))}
          </div>
        </section>

        {/* 地域・費用 */}
        <section className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-bold">募集エリア・費用</h2>
          <Field label="都道府県" required>
            <select
              aria-label="都道府県"
              className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm"
              value={prefectureSlug}
              onChange={(e) => setPrefectureSlug(e.target.value)}
              required
            >
              <option value="">選択してください</option>
              {prefectures.map((p) => (
                <option key={p.slug} value={p.slug}>{p.label}</option>
              ))}
            </select>
          </Field>

          <Field label="初期費用" required>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-3">
                {([
                  ['free', '無料'],
                  ['amount', '金額を入力'],
                  ['unknown', '応相談'],
                ] as const).map(([mode, label]) => (
                  <label key={mode} className="flex items-center gap-1 text-sm">
                    <input
                      type="radio"
                      name="initialCostMode"
                      checked={initialCostMode === mode}
                      onChange={() => setInitialCostMode(mode)}
                    />
                    {label}
                  </label>
                ))}
              </div>
              {initialCostMode === 'amount' && (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={initialCostAmount}
                    onChange={(e) => setInitialCostAmount(e.target.value)}
                    placeholder="例：500000"
                  />
                  <span className="text-sm">円</span>
                </div>
              )}
            </div>
          </Field>

          <Field label="想定年商（任意）">
            <div className="space-y-2">
              <div className="flex gap-3">
                {([
                  ['amount', '金額を入力'],
                  ['unknown', '応相談'],
                ] as const).map(([mode, label]) => (
                  <label key={mode} className="flex items-center gap-1 text-sm">
                    <input
                      type="radio"
                      name="revenueMode"
                      checked={revenueMode === mode}
                      onChange={() => setRevenueMode(mode)}
                    />
                    {label}
                  </label>
                ))}
              </div>
              {revenueMode === 'amount' && (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={revenueAmount}
                    onChange={(e) => setRevenueAmount(e.target.value)}
                    placeholder="例：5000000"
                  />
                  <span className="text-sm">円</span>
                </div>
              )}
            </div>
          </Field>

          <Field label="加盟金（任意）">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-3">
                {([
                  ['amount', '金額を入力'],
                  ['unknown', '応相談'],
                ] as const).map(([mode, label]) => (
                  <label key={mode} className="flex items-center gap-1 text-sm">
                    <input
                      type="radio"
                      name="franchiseFeeMode"
                      checked={franchiseFeeMode === mode}
                      onChange={() => setFranchiseFeeMode(mode)}
                    />
                    {label}
                  </label>
                ))}
              </div>
              {franchiseFeeMode === 'amount' && (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={franchiseFeeAmount}
                    onChange={(e) => setFranchiseFeeAmount(e.target.value)}
                    placeholder="例：0（無料）"
                  />
                  <span className="text-sm">円</span>
                </div>
              )}
            </div>
          </Field>

          <Field label="仕入れ">
            <div className="flex flex-wrap gap-2">
              {STOCK_TYPES.map((t) => (
                <label
                  key={t.slug}
                  className={cn(
                    'flex cursor-pointer items-center gap-1 rounded-lg border px-3 py-2 text-sm',
                    stockType === t.slug ? 'border-brand-600 bg-brand-50' : 'border-gray-200'
                  )}
                >
                  <input
                    type="radio"
                    name="stockType"
                    checked={stockType === t.slug}
                    onChange={() => setStockType(t.slug)}
                  />
                  {t.label}
                </label>
              ))}
            </div>
          </Field>

          <Field label="想定月商（任意）">
            <div className="space-y-2">
              <div className="flex gap-3">
                {([
                  ['amount', '金額を入力'],
                  ['unknown', '応相談'],
                ] as const).map(([mode, label]) => (
                  <label key={mode} className="flex items-center gap-1 text-sm">
                    <input
                      type="radio"
                      name="profitMode"
                      checked={profitMode === mode}
                      onChange={() => setProfitMode(mode)}
                    />
                    {label}
                  </label>
                ))}
              </div>
              {profitMode === 'amount' && (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={profitAmount}
                    onChange={(e) => setProfitAmount(e.target.value)}
                    placeholder="例：500000"
                  />
                  <span className="text-sm">円</span>
                </div>
              )}
            </div>
          </Field>

          <Field label="収益タイプ">
            <div className="flex flex-wrap gap-2">
              {REVENUE_TYPES.map((t) => (
                <label
                  key={t.slug}
                  className={cn(
                    'flex cursor-pointer items-center gap-1 rounded-lg border px-3 py-2 text-sm',
                    revenueType === t.slug ? 'border-brand-600 bg-brand-50' : 'border-gray-200'
                  )}
                >
                  <input
                    type="radio"
                    name="revenueType"
                    checked={revenueType === t.slug}
                    onChange={() => setRevenueType(t.slug)}
                  />
                  {t.label}
                </label>
              ))}
            </div>
          </Field>

          <Field label="組織拡大">
            <div className="flex flex-wrap gap-2">
              {ORGANIZATION_TYPES.map((t) => (
                <label
                  key={t.slug}
                  className={cn(
                    'flex cursor-pointer items-center gap-1 rounded-lg border px-3 py-2 text-sm',
                    organizationType === t.slug ? 'border-brand-600 bg-brand-50' : 'border-gray-200'
                  )}
                >
                  <input
                    type="radio"
                    name="organizationType"
                    checked={organizationType === t.slug}
                    onChange={() => setOrganizationType(t.slug)}
                  />
                  {t.label}
                </label>
              ))}
            </div>
          </Field>
        </section>

        {/* 会社情報 */}
        <section className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-bold">会社情報</h2>
          <p className="text-xs text-gray-500">
            案件詳細ページのサイドバーに表示されます。任意項目です。
          </p>
          <Field label="所在地">
            <Input
              value={companyInfo.companyAddress}
              onChange={(e) =>
                setCompanyInfo({ ...companyInfo, companyAddress: e.target.value })
              }
              placeholder="〒100-0001 東京都千代田区..."
            />
          </Field>
          <Field label="代表者">
            <Input
              value={companyInfo.companyRepresentative}
              onChange={(e) =>
                setCompanyInfo({ ...companyInfo, companyRepresentative: e.target.value })
              }
              placeholder="代表取締役 山田 太郎"
            />
          </Field>
          <Field label="設立">
            <Input
              value={companyInfo.companyEstablished}
              onChange={(e) =>
                setCompanyInfo({ ...companyInfo, companyEstablished: e.target.value })
              }
              placeholder="2010年4月"
            />
          </Field>
          <Field label="事業内容">
            <Textarea
              rows={2}
              value={companyInfo.companyBusiness}
              onChange={(e) =>
                setCompanyInfo({ ...companyInfo, companyBusiness: e.target.value })
              }
              placeholder="電気通信事業、情報処理サービス業..."
            />
          </Field>
        </section>

        {/* ビジネスの説明 */}
        <section className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-bold">ビジネスの説明</h2>
          <p className="text-xs text-gray-500">
            番号付きで最大5項目まで。空欄の項目は表示されません。
          </p>
          {businessPoints.map((point, i) => (
            <div key={i} className="space-y-3 rounded-lg border border-gray-200 p-4">
              <p className="text-xs font-bold text-gray-500">項目 {i + 1}</p>
              <Field label="見出し">
                <Input
                  value={point.title}
                  onChange={(e) => {
                    const next = [...businessPoints];
                    next[i] = { ...next[i], title: e.target.value };
                    setBusinessPoints(next);
                  }}
                  placeholder="SIMは1枚から仕入れ可能。大量在庫を抱えず小さくスタート"
                />
              </Field>
              <Field label="本文">
                <Textarea
                  rows={4}
                  value={point.body}
                  onChange={(e) => {
                    const next = [...businessPoints];
                    next[i] = { ...next[i], body: e.target.value };
                    setBusinessPoints(next);
                  }}
                  placeholder="本文を入力（改行で段落分けできます）"
                />
              </Field>
            </div>
          ))}
        </section>

        {/* こんな方におすすめ */}
        <section className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-bold">こんな方におすすめ</h2>
          <p className="text-xs text-gray-500">
            案件詳細ページに箇条書きで表示されます。最大5個まで。
          </p>
          {recommendedFor.map((item, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={item}
                onChange={(e) => {
                  const next = [...recommendedFor];
                  next[i] = e.target.value;
                  setRecommendedFor(next);
                }}
                placeholder="既存の顧客基盤に新しい商材を加えたい"
              />
              {recommendedFor.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setRecommendedFor(recommendedFor.filter((_, j) => j !== i))
                  }
                  className="shrink-0 rounded-lg border border-gray-300 px-3 text-sm text-gray-500 hover:bg-gray-50"
                >
                  削除
                </button>
              )}
            </div>
          ))}
          {recommendedFor.length < 5 && (
            <button
              type="button"
              onClick={() => setRecommendedFor([...recommendedFor, ''])}
              className="text-sm text-emerald-700 underline hover:no-underline"
            >
              ＋ 項目を追加
            </button>
          )}
        </section>

        {/* 詳細情報 */}
        <section className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-bold">詳細情報</h2>
          <p className="text-xs text-gray-500">
            案件詳細ページのサイドバーに表示されます。任意項目です。
          </p>
          <Field label="販売先">
            <Input
              value={detailInfo.salesTarget}
              onChange={(e) =>
                setDetailInfo({ ...detailInfo, salesTarget: e.target.value })
              }
              placeholder="法人、個人ほか"
            />
          </Field>
          <Field label="販売方法">
            <Input
              value={detailInfo.salesMethod}
              onChange={(e) =>
                setDetailInfo({ ...detailInfo, salesMethod: e.target.value })
              }
              placeholder="訪問販売、テレアポ、既存顧客への紹介ほか"
            />
          </Field>
          <Field label="収益">
            <Input
              value={detailInfo.earnings}
              onChange={(e) =>
                setDetailInfo({ ...detailInfo, earnings: e.target.value })
              }
              placeholder="卸価格と貴社販売価格の差益（ストック収益）"
            />
          </Field>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-800">最適な代理店様</p>
            {agentFit.map((item, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={item}
                  onChange={(e) => {
                    const next = [...agentFit];
                    next[i] = e.target.value;
                    setAgentFit(next);
                  }}
                  placeholder="通信事業を始めたい方"
                />
                {agentFit.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setAgentFit(agentFit.filter((_, j) => j !== i))}
                    className="shrink-0 rounded-lg border border-gray-300 px-3 text-sm text-gray-500 hover:bg-gray-50"
                  >
                    削除
                  </button>
                )}
              </div>
            ))}
            {agentFit.length < 5 && (
              <button
                type="button"
                onClick={() => setAgentFit([...agentFit, ''])}
                className="text-sm text-emerald-700 underline hover:no-underline"
              >
                ＋ 項目を追加
              </button>
            )}
          </div>
        </section>

        {/* その他 */}
        <section className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-bold">その他</h2>
          {([
            ['requirements', '応募条件'],
            ['reward', '報酬体系'],
            ['initialCost', '初期費用（自由記述）'],
            ['royalty', 'ロイヤリティ'],
            ['area', '募集エリア（自由記述）'],
          ] as const).map(([key, label]) => (
            <Field key={key} label={label}>
              <Textarea
                aria-label={label}
                rows={2}
                value={fields[key]}
                onChange={(e) => setFields({ ...fields, [key]: e.target.value })}
              />
            </Field>
          ))}
        </section>

        {listing && (
          <p className="text-sm text-gray-600">
            保存すると下書き、または審査中になります。再公開には審査が必要です。
          </p>
        )}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" value="draft" variant="outline" disabled={saving}>
            下書き保存
          </Button>
          <Button type="submit" value="reviewing" loading={saving}>
            審査申請
          </Button>
        </div>
      </form>

      {/* ============================================================
          右カラム：ライブプレビュー（lg 以上のみ）
      ============================================================ */}
      <aside className="hidden lg:block">
        <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl border border-gray-200 bg-gray-100 p-3">
          <div className="mb-3 flex items-center justify-between px-1">
            <span className="text-xs font-bold text-gray-500">ライブプレビュー</span>
            <span className="text-[10px] text-gray-400">保存前の見た目</span>
          </div>
          <ListingDetail listing={previewListing} preview />
        </div>
      </aside>
    </div>
  );
}
