import type { MetadataRoute } from 'next';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { GUIDE_ARTICLES } from '@/lib/guideArticles';
import { AREA_LABELS } from '@/lib/masterLabels';

const SITE_URL = 'https://partners-tau-kohl.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── 静的ページ ──
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: new Date(), priority: 1.0 },
    { url: `${SITE_URL}/listings`, lastModified: new Date(), priority: 0.9 },
    { url: `${SITE_URL}/guide`, lastModified: new Date(), priority: 0.8 },
    { url: `${SITE_URL}/for-advertisers`, lastModified: new Date(), priority: 0.7 },
  ];

  // ── ガイド記事 ──
  const guideRoutes: MetadataRoute.Sitemap = GUIDE_ARTICLES.map((a) => ({
    url: `${SITE_URL}/guide/${a.slug}`,
    lastModified: new Date(a.updatedAt ?? a.publishedAt),
    priority: 0.6,
  }));

  // ── エリアページ ──
  const areaRoutes: MetadataRoute.Sitemap = Object.keys(AREA_LABELS).map((slug) => ({
    url: `${SITE_URL}/area/${slug}`,
    lastModified: new Date(),
    priority: 0.6,
  }));

  // ── Firestoreから公開中の案件を取得 ──
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
      const updatedAt = data.updatedAt?.toDate?.() ?? data.publishedAt?.toDate?.() ?? new Date();
      return {
        url: `${SITE_URL}/listings/${d.id}`,
        lastModified: updatedAt,
        priority: 0.8,
      };
    });
  } catch (e) {
    console.error('sitemap: failed to fetch listings', e);
  }

  return [...staticRoutes, ...guideRoutes, ...areaRoutes, ...listingRoutes];
}
