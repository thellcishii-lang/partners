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
    slug: 'why-agent-business',
    title: '起業するなら、代理店が正解な理由',
    description:
      '1から全てを作り上げるのは、費用も時間もかかる。既存のプラットフォームに乗る方が、成功確率は圧倒的に高い。その理由を徹底解説します。',
    category: 'startup',
    tags: ['起業', '代理店', '独立'],
    publishedAt: '2026-10-08',
    readingMinutes: 8,
    featured: true,
  },
  {
    slug: 'agent-vs-franchise',
    title: '代理店とフランチャイズ、どっちがいい？',
    description:
      '「代理店」と「フランチャイズ」は似て非なるもの。初期費用、縛り、収益構造の違いを、両者の実態を踏まえて比較します。',
    category: 'comparison',
    tags: ['代理店', 'フランチャイズ', '比較'],
    publishedAt: '2026-10-08',
    readingMinutes: 10,
  },
  {
    slug: 'side-job-agent',
    title: '副業で代理店を始める完全ガイド',
    description:
      '会社員でもできる代理店ビジネス。初期費用0円で始められる案件から、確定申告の注意点まで、初めての方に向けて解説します。',
    category: 'side-job',
    tags: ['副業', '代理店', '会社員'],
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
