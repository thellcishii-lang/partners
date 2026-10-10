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
  {
    slug: 'why-startups-fail',
    title: '起業で失敗する人の、共通点',
    description:
      '起業の失敗には、明確なパターンがあります。勢いだけ、1から作ろうとする、市場を見ない——5つの共通点と、その避け方を解説します。',
    category: 'startup',
    tags: ['起業', '失敗', '失敗パターン', '独立'],
    publishedAt: '2026-10-08',
    readingMinutes: 9,
  },
  {
    slug: 'pre-startup-checklist',
    title: '起業前に、絶対に確認しておくべき5つのこと',
    description:
      '起業は勢いだけでは続きません。生活費、家族の同意、就業規則、適性、選択肢——始める前に必ず確認したい5つのポイントを解説します。',
    category: 'startup',
    tags: ['起業', '準備', 'チェックリスト'],
    publishedAt: '2026-10-08',
    readingMinutes: 9,
  },
  {
    slug: 'startup-not-just-passion',
    title: '起業は、勢いだけでは続かない',
    description:
      '「好きなことを仕事にしたい」——その思いは大切。でも、思いだけでは続かないのが現実です。長く続けるための「仕組み」について考えます。',
    category: 'startup',
    tags: ['起業', 'マインド', '心構え'],
    publishedAt: '2026-10-08',
    readingMinutes: 8,
  },
  {
    slug: 'stock-business-basics',
    title: 'ストックビジネスとは？サブスク時代に注目される仕組み',
    description:
      '毎月、安定した収入が入るストックビジネス。サブスクの広がりとともに、あらゆる業界に広がっています。種類・メリット・注意点を中立に解説します。',
    category: 'know-how',
    tags: ['ストックビジネス', 'サブスク', '継続収益'],
    publishedAt: '2026-10-08',
    readingMinutes: 11,
    featured: true,
  },
  {
    slug: 'ai-saas-agent',
    title: 'AI・SaaS代理店の始め方｜未経験からストック収益を作る',
    description:
      'AI・SaaSは今もっとも代理店案件が増えている分野。在庫不要・初期費用0円〜で始められ、契約が続く限り継続報酬が入ります。仕組みと始め方を解説。',
    category: 'industry',
    tags: ['AI 代理店', 'SaaS 代理店', 'ストック収益', '副業'],
    publishedAt: '2026-10-10',
    readingMinutes: 10,
  },
  {
    slug: 'telecom-agent',
    title: '通信代理店で稼ぐ仕組み｜携帯・光回線の代理店の始め方',
    description:
      '携帯キャリア・光回線は代理店ビジネスの代表格。成約単価が高く、継続報酬も狙えます。未経験から始める方法と、稼ぐコツを解説します。',
    category: 'industry',
    tags: ['通信 代理店', '携帯 代理店', '光回線 代理店', '副業'],
    publishedAt: '2026-10-10',
    readingMinutes: 11,
  },
  {
    slug: 'beauty-franchise',
    title: '美容・エステ・脱毛サロンの加盟店の選び方',
    description:
      'エステ・脱毛・ネイル・美容室の加盟店選びで失敗しないために。フランチャイズと代理店の違い、チェックすべき5つのポイントを解説します。',
    category: 'industry',
    tags: ['エステ 加盟店', '脱毛 サロン', '美容室 独立', 'フランチャイズ'],
    publishedAt: '2026-10-10',
    readingMinutes: 11,
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
