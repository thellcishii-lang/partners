import type { MetadataRoute } from 'next';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { GUIDE_ARTICLES } from '@/lib/guideArticles';
import {
  TARGET_LABELS,
  PRODUCT_LABELS,
  MODEL_LABELS,
  AREA_LABELS,
  INITIAL_COST_LABELS,
} from '@/lib/masterLabels';

const SITE_URL = 'https://www.代理店・加盟店募集.com';

const REGION_SLUG_SET = new Set([
  'hokkaido', 'tohoku', 'kanto', 'chubu', 'kansai', 'chugoku', 'shikoku', 'kyushu',
]);

type FacetDates = {
  target: Map<string, Date>;
  product: Map<string, Date>;
  model: Map<string, Date>;
  area: Map<string, Date>;
  cost: Map<string, Date>;
};

function addFacetDate(map: Map<string, Date>, slug: string, date: Date) {
  const current = map.get(slug);
  if (!current || date > current) map.set(slug, date);
}

function toSlugArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((v): v is string => typeof v === 'string')
    : [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ── ガイド記事（実日付） ──
  const guideDates = GUIDE_ARTICLES.map(
    (a) => new Date(a.updatedAt ?? a.publishedAt)
  );
  const guideRoutes: MetadataRoute.Sitemap = GUIDE_ARTICLES.map((a, i) => ({
    url: `${SITE_URL}/guide/${a.slug}`,
    lastModified: guideDates[i],
    priority: 0.7,
  }));

  // ── Firestore から公開中の案件 ──
  // 案件が1件以上あるファセットだけを sitemap に載せ、
  // lastModified は各ページの実データの最新更新日に合わせる。
  // 取得に失敗した場合は、従来どおり全ファセット＋現在日時で返す
  // （sitemap が痩せてしまう事故を避けるためのフォールバック）。
  let listingRoutes: MetadataRoute.Sitemap = [];
  let facets: FacetDates | null = null;
  let latestListingDate: Date | null = null;

  try {
    const db = getAdminDb();
    const snap = await db
      .collection('listings')
      .where('status', '==', 'published')
      .limit(1000)
      .get();

    const collected: FacetDates = {
      target: new Map(),
      product: new Map(),
      model: new Map(),
      area: new Map(),
      cost: new Map(),
    };

    listingRoutes = snap.docs.map((d) => {
      const data = d.data();
      const updatedAt: Date =
        data.updatedAt?.toDate?.() ?? data.publishedAt?.toDate?.() ?? now;

      if (!latestListingDate || updatedAt > latestListingDate) {
        latestListingDate = updatedAt;
      }

      for (const slug of toSlugArray(data.targetSlugs)) {
        addFacetDate(collected.target, slug, updatedAt);
      }
      for (const slug of toSlugArray(data.productSlugs)) {
        addFacetDate(collected.product, slug, updatedAt);
      }
      for (const slug of toSlugArray(data.modelSlugs)) {
        addFacetDate(collected.model, slug, updatedAt);
      }

      // エリアは案件ページ側の絞り込み条件（serverListings）と一致させる。
      // 全国案件は全エリアに展開されて検索用配列に入っている前提だが、
      // 念のため areaMode でも補完する。
      const areaSlugs = new Set<string>([
        ...toSlugArray(data.areaSearchRegionSlugs),
        ...toSlugArray(data.areaSearchPrefectureSlugs),
      ]);
      if (data.areaMode === 'nationwide') {
        for (const slug of Object.keys(AREA_LABELS)) areaSlugs.add(slug);
      } else if (data.areaMode === 'region') {
        for (const slug of toSlugArray(data.areaSlugs)) {
          if (REGION_SLUG_SET.has(slug)) areaSlugs.add(slug);
        }
      } else if (data.areaMode === 'prefecture') {
        for (const slug of toSlugArray(data.areaSlugs)) {
          if (!REGION_SLUG_SET.has(slug)) areaSlugs.add(slug);
        }
      }
      for (const slug of areaSlugs) {
        if (slug in AREA_LABELS) addFacetDate(collected.area, slug, updatedAt);
      }

      if (typeof data.initialCostRange === 'string' && data.initialCostRange) {
        addFacetDate(collected.cost, data.initialCostRange, updatedAt);
      }

      return {
        url: `${SITE_URL}/listings/${d.id}`,
        lastModified: updatedAt,
        priority: 0.8,
      };
    });

    facets = collected;
  } catch (e) {
    console.error('sitemap: failed to fetch listings', e);
    listingRoutes = [];
    facets = null;
    latestListingDate = null;
  }

  // 静的ページの lastModified は、サイト内の実コンテンツ
  // （案件・ガイド）の最新更新日に合わせる。
  const siteUpdatedAt: Date =
    [latestListingDate, ...guideDates]
      .filter((d): d is Date => !!d)
      .sort((a, b) => b.getTime() - a.getTime())[0] ?? now;

  const staticLastModified = facets ? siteUpdatedAt : now;

  // ── 静的ページ ──
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: staticLastModified, priority: 1.0 },
    { url: `${SITE_URL}/listings`, lastModified: staticLastModified, priority: 0.9 },
    { url: `${SITE_URL}/eat`, lastModified: staticLastModified, priority: 0.9 },
    { url: `${SITE_URL}/beauty`, lastModified: staticLastModified, priority: 0.9 },
    { url: `${SITE_URL}/it`, lastModified: staticLastModified, priority: 0.9 },
    { url: `${SITE_URL}/school`, lastModified: staticLastModified, priority: 0.9 },
    { url: `${SITE_URL}/medical`, lastModified: staticLastModified, priority: 0.9 },
    { url: `${SITE_URL}/logistics`, lastModified: staticLastModified, priority: 0.9 },
    { url: `${SITE_URL}/realestate`, lastModified: staticLastModified, priority: 0.9 },
    { url: `${SITE_URL}/office`, lastModified: staticLastModified, priority: 0.9 },
    { url: `${SITE_URL}/life`, lastModified: staticLastModified, priority: 0.9 },
    { url: `${SITE_URL}/guide`, lastModified: staticLastModified, priority: 0.8 },
    { url: `${SITE_URL}/for-advertisers`, lastModified: staticLastModified, priority: 0.7 },
    { url: `${SITE_URL}/legal/terms`, priority: 0.3 },
    { url: `${SITE_URL}/legal/privacy`, priority: 0.3 },
    { url: `${SITE_URL}/legal/tokushoho`, priority: 0.3 },
  ];

  // ── ファセット（案件があるものだけ。失敗時は全件） ──
  const facetRoutes = (
    labels: Record<string, unknown>,
    dates: Map<string, Date> | undefined,
    buildPath: (slug: string) => string
  ): MetadataRoute.Sitemap =>
    Object.keys(labels)
      .filter((slug) => !facets || (dates?.has(slug) ?? false))
      .map((slug) => ({
        url: `${SITE_URL}${buildPath(slug)}`,
        lastModified: facets ? dates?.get(slug) ?? siteUpdatedAt : now,
        priority: 0.6,
      }));

  const targetRoutes = facetRoutes(TARGET_LABELS, facets?.target, (s) => `/target/${s}`);
  const productRoutes = facetRoutes(PRODUCT_LABELS, facets?.product, (s) => `/product/${s}`);
  const modelRoutes = facetRoutes(MODEL_LABELS, facets?.model, (s) => `/model/${s}`);
  const areaRoutes = facetRoutes(AREA_LABELS, facets?.area, (s) => `/area/${s}`);
  const costRoutes = facetRoutes(
    INITIAL_COST_LABELS,
    facets?.cost,
    (s) => `/cost/initial/${s}`
  );

  return [
    ...staticRoutes,
    ...targetRoutes,
    ...productRoutes,
    ...modelRoutes,
    ...areaRoutes,
    ...costRoutes,
    ...guideRoutes,
    ...listingRoutes,
  ];
}
