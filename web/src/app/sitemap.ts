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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ── 静的ページ ──
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, priority: 1.0 },
    { url: `${SITE_URL}/listings`, lastModified: now, priority: 0.9 },
    { url: `${SITE_URL}/guide`, lastModified: now, priority: 0.8 },
    { url: `${SITE_URL}/for-advertisers`, lastModified: now, priority: 0.7 },
    { url: `${SITE_URL}/legal/terms`, lastModified: now, priority: 0.3 },
    { url: `${SITE_URL}/legal/privacy`, lastModified: now, priority: 0.3 },
    { url: `${SITE_URL}/legal/tokushoho`, lastModified: now, priority: 0.3 },
  ];

  // ── ターゲット ──
  const targetRoutes: MetadataRoute.Sitemap = Object.keys(TARGET_LABELS).map((slug) => ({
    url: `${SITE_URL}/target/${slug}`,
    lastModified: now,
    priority: 0.6,
  }));

  // ── 商材 ──
  const productRoutes: MetadataRoute.Sitemap = Object.keys(PRODUCT_LABELS).map((slug) => ({
    url: `${SITE_URL}/product/${slug}`,
    lastModified: now,
    priority: 0.6,
  }));

  // ── 探し方 ──
  const modelRoutes: MetadataRoute.Sitemap = Object.keys(MODEL_LABELS).map((slug) => ({
    url: `${SITE_URL}/model/${slug}`,
    lastModified: now,
    priority: 0.6,
  }));

  // ── エリア ──
  const areaRoutes: MetadataRoute.Sitemap = Object.keys(AREA_LABELS).map((slug) => ({
    url: `${SITE_URL}/area/${slug}`,
    lastModified: now,
    priority: 0.6,
  }));

  // ── 初期費用 ──
  const costRoutes: MetadataRoute.Sitemap = Object.keys(INITIAL_COST_LABELS).map((slug) => ({
    url: `${SITE_URL}/cost/initial/${slug}`,
    lastModified: now,
    priority: 0.6,
  }));

  // ── ガイド記事 ──
  const guideRoutes: MetadataRoute.Sitemap = GUIDE_ARTICLES.map((a) => ({
    url: `${SITE_URL}/guide/${a.slug}`,
    lastModified: new Date(a.updatedAt ?? a.publishedAt),
    priority: 0.7,
  }));

  // ── Firestore から公開中の案件 ──
  let listingRoutes: MetadataRoute.Sitemap = [];
  try {
    const db = getAdminDb();
    const snap = await db
      .collection('listings')
      .where('status', '==', 'published')
      .limit(1000)
      .get();

    listingRoutes = snap.docs.map((d) => {
      const data = d.data();
      const updatedAt =
        data.updatedAt?.toDate?.() ?? data.publishedAt?.toDate?.() ?? now;
      return {
        url: `${SITE_URL}/listings/${d.id}`,
        lastModified: updatedAt,
        priority: 0.8,
      };
    });
  } catch (e) {
    console.error('sitemap: failed to fetch listings', e);
  }

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
