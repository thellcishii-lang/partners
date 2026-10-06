'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { collection, doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes, type StorageReference } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Input';
import { useMasters } from '@/hooks/useMasters';
import {
  buildSearchText,
  getInitialCostLabel,
  getInitialCostRange,
  getExpectedRevenueLabel,
  getExpectedRevenueRange,
  getRegionSlug,
  getRegionLabel,
} from '@/lib/listingFilters';
import {
  LISTING_CATEGORIES,
  type Advertiser,
  type Listing,
  type ListingCategory,
} from '@/types';
import { cn } from '@/lib/cn';

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

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

  // 費用
  type CostMode = 'free' | 'amount' | 'unknown';
  const [initialCostMode, setInitialCostMode] = useState<CostMode>(
    listing?.initialCostRange === 'initial-free' ? 'free'
      : listing?.initialCostRange === 'initial-unknown' || !listing ? 'unknown'
        : 'amount'
  );
  const [initialCostAmount, setInitialCostAmount] = useState<string>(
    listing?.initialCostYen ? String(listing.initialCostYen) : ''
  );
  type RevenueMode = 'amount' | 'unknown';
  const [revenueMode, setRevenueMode] = useState<RevenueMode>(
    listing?.expectedRevenueRange === 'revenue-unknown' || !listing ? 'unknown' : 'amount'
  );
  const [revenueAmount, setRevenueAmount] = useState<string>(
    listing?.expectedRevenueYen ? String(listing.expectedRevenueYen) : ''
  );

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
  const [images, setImages] = useState<string[]>(listing?.images ?? []);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    const previews = imageFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
    return () => previews.forEach((preview) => URL.revokeObjectURL(preview));
  }, [imageFiles]);

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
      // OFF：親 + サブ全部外す
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
      // 親も一緒にONにする
      const next = new Set([...productSlugs, subSlug, parentSlug]);
      setProductSlugs([...next]);
    }
  };

  // ============================================================
  // 保存
  // ============================================================
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const status =
      submitter instanceof HTMLButtonElement && submitter.value === 'reviewing'
        ? 'reviewing'
        : 'draft';

    // バリデーション
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

    const uploadedImageRefs: StorageReference[] = [];
    let listingSaved = false;
    try {
      // ============================================================
      // フィルタ用のdenormalize
      // ============================================================
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

      const data = {
        title: title.trim(),
        category,
        description: description.trim(),
        ...Object.fromEntries(
          Object.entries(fields).map(([key, value]) => [key, value.trim()])
        ),
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

        searchText,

        status,
        updatedAt: serverTimestamp(),
      };

      const listingRef = listing
        ? doc(db, 'listings', listing.id)
        : doc(collection(db, 'listings'));
      const uploadedImages: string[] = [];
      for (const file of imageFiles) {
        const imageRef = ref(
          storage,
          `listings/${advertiser.uid}/${listingRef.id}/${crypto.randomUUID()}`
        );
        await uploadBytes(imageRef, file, { contentType: file.type });
        uploadedImageRefs.push(imageRef);
        uploadedImages.push(await getDownloadURL(imageRef));
      }
      const savedImages = [...images, ...uploadedImages];

      if (listing) {
        await updateDoc(listingRef, { ...data, images: savedImages });
      } else {
        await setDoc(listingRef, {
          ...data,
          advertiserId: advertiser.uid,
          images: savedImages,
          publishedAt: null,
          createdAt: serverTimestamp(),
        });
      }
      listingSaved = true;
      const removedImages = (listing?.images ?? []).filter((image) => !images.includes(image));
      if (removedImages.length > 0) {
        await Promise.all(removedImages.map((image) => deleteObject(ref(storage, image))));
      }
      router.push('/dashboard');
    } catch (error) {
      let message = error instanceof Error ? error.message : '案件の保存に失敗しました。';
      if (listingSaved) {
        message = `案件は保存されましたが、画像の削除に失敗しました: ${message}`;
      } else if (uploadedImageRefs.length > 0) {
        try {
          await Promise.all(uploadedImageRefs.map((imageRef) => deleteObject(imageRef)));
        } catch (cleanupError) {
          const cleanupMessage = cleanupError instanceof Error
            ? cleanupError.message
            : '不明なエラー';
          message += ` 画像の後片付けにも失敗しました: ${cleanupMessage}`;
        }
      }
      setError(message);
      setSaving(false);
    }
  };

  const addImages = (files: FileList | null) => {
    if (!files?.length) return;
    const selectedFiles = Array.from(files);
    const invalidType = selectedFiles.find((file) => !ALLOWED_IMAGE_TYPES.has(file.type));
    if (invalidType) {
      setError('画像はJPEG、PNG、WebP、GIF形式を選択してください。');
      return;
    }
    if (selectedFiles.some((file) => file.size > MAX_IMAGE_SIZE)) {
      setError('画像は1枚あたり5MB以下にしてください。');
      return;
    }
    if (images.length + imageFiles.length + selectedFiles.length > MAX_IMAGES) {
      setError(`画像は最大${MAX_IMAGES}枚まで添付できます。`);
      return;
    }
    setError('');
    setImageFiles((current) => [...current, ...selectedFiles]);
  };

  if (mastersLoading) {
    return <p className="text-center text-sm text-gray-500">マスタを読み込み中…</p>;
  }

  return (
    <form onSubmit={save} className="space-y-6">
      {/* ============================================================
          基本情報
      ============================================================ */}
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

      {/* ============================================================
          3軸
      ============================================================ */}
      <section className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="font-bold">ターゲット（誰向けか）<span className="ml-2 text-xs text-red-500">必須</span></h2>
        <p className="text-xs text-gray-500">複数選択できます。</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {targetCategories.map((c) => (
            <label
              key={c.slug}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm',
                targetSlugs.includes(c.slug)
                  ? 'border-brand-600 bg-brand-50'
                  : 'border-gray-200'
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

      <section className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="font-bold">商材（何を扱うか）<span className="ml-2 text-xs text-red-500">必須</span></h2>
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
                          productSlugs.includes(sub.slug)
                            ? 'border-brand-600 bg-brand-50'
                            : 'border-gray-200'
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

      {/* ============================================================
          地域・費用
      ============================================================ */}
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
      </section>

      {/* ============================================================
          その他
      ============================================================ */}
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

      <section className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="font-bold">募集画像</h2>
        <p className="text-sm text-gray-600">
          JPEG、PNG、WebP、GIF形式。1枚5MB以下、最大{MAX_IMAGES}枚まで添付できます。
        </p>
        <input
          aria-label="募集画像を追加"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          disabled={saving || images.length + imageFiles.length >= MAX_IMAGES}
          onChange={(event) => {
            addImages(event.currentTarget.files);
            event.currentTarget.value = '';
          }}
        />
        {(images.length > 0 || imageFiles.length > 0) && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((image, index) => (
              <div key={image} className="space-y-1">
                <img src={image} alt={`募集画像 ${index + 1}`} className="h-48 w-full rounded-lg bg-gray-50 object-contain" />
                <button
                  type="button"
                  className="text-sm text-red-600 underline"
                  disabled={saving}
                  onClick={() => setImages((current) => current.filter((_, imageIndex) => imageIndex !== index))}
                >
                  この画像を削除
                </button>
              </div>
            ))}
            {imagePreviews.map((preview, index) => (
              <div key={preview} className="space-y-1">
                <img src={preview} alt={`追加する募集画像 ${index + 1}`} className="h-48 w-full rounded-lg bg-gray-50 object-contain" />
                <button
                  type="button"
                  className="text-sm text-red-600 underline"
                  disabled={saving}
                  onClick={() => setImageFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))}
                >
                  追加を取り消す
                </button>
              </div>
            ))}
          </div>
        )}
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
  );
}
