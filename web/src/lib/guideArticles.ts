// ============================================================
// ガイド記事のメタデータ
// ============================================================

export type GuideCategory =
  | 'startup'      // 起業・独立
  | 'agent'        // 代理店・加盟店
  | 'side-job'     // 副業
  | 'industry'     // 業種別
  | 'comparison'   // 比較
  | 'know-how';    // ノウハウ

export const CATEGORY_LABELS: Record<GuideCategory, string> = {
  startup: '起業・独立',
  agent: '代理店・加盟店',
  'side-job': '副業',
  industry: '業種別',
  comparison: '比較',
  'know-how': 'ノウハウ',
};

export interface GuideArticle {
  slug: string;
  title: string;
  description: string;
  category: GuideCategory;
  tags: string[];
  publishedAt: string;
  updatedAt?: string;
  readingMinutes: number;
  featured?: boolean;
}

export const GUIDE_ARTICLES: GuideArticle[] = [
  {
    slug: 'why-platform-business',
    title: '起業するなら、1から始めない方がいい理由',
    description:
      '1から全てを作り上げるのは、費用も時間もかかる。代理店・FC・加盟店などの既存プラットフォームに乗ることで、少ないリスクで事業を始められます。',
    category: 'startup',
    tags: ['起業', '代理店', 'フランチャイズ', '加盟店', '独立'],
    publishedAt: '2026-10-08',
    readingMinutes: 8,
    featured: true,
  },
  {
    slug: 'agent-vs-franchise',
    title: '代理店・フランチャイズ・加盟店の違い、徹底解説',
    description:
      '「代理店」「フランチャイズ」「加盟店」は似て非なるもの。仕組み、初期費用、収益構造の違いを整理し、自分に合うのはどれかを判断できるように解説します。',
    category: 'comparison',
    tags: ['代理店', 'フランチャイズ', '加盟店', '比較'],
    publishedAt: '2026-10-08',
    readingMinutes: 10,
  },
  {
    slug: 'side-job-agent',
    title: '副業で代理店・加盟店を始める完全ガイド',
    description:
      '会社員でもできる代理店ビジネス。初期費用0円で始められる案件から、確定申告・就業規則の注意点まで、初めての方に向けて解説します。',
    category: 'side-job',
    tags: ['副業', '代理店', '加盟店', '会社員'],
    publishedAt: '2026-10-08',
    readingMinutes: 12,
  },
];

export function getArticleBySlug(slug: string): GuideArticle | undefined {
  return GUIDE_ARTICLES.find((a) => a.slug === slug);
}

export function getFeaturedArticles(): GuideArticle[] {
  return GUIDE_ARTICLES.filter((a) => a.featured);
}

export function getArticlesByCategory(category: GuideCategory): GuideArticle[] {
  return GUIDE_ARTICLES.filter((a) => a.category === category);
}

export function getAllCategories(): GuideCategory[] {
  const cats = new Set<GuideCategory>();
  GUIDE_ARTICLES.forEach((a) => cats.add(a.category));
  return Array.from(cats);
}
