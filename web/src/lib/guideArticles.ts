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
    {
    slug: 'solar-reform-agent',
    title: '太陽光・リフォーム代理店の注意点｜高単価の裏側',
    description:
      '住宅関連は高単価な代理店案件が豊富。一方で悪質業者も多い分野です。仕組み、稼ぐコツ、失敗しないための注意点をまとめて解説します。',
    category: 'industry',
    tags: ['太陽光 代理店', 'リフォーム 代理店', '蓄電池', '住宅 営業'],
    publishedAt: '2026-10-10',
    readingMinutes: 11,
  },
  {
    slug: 'insurance-agent',
    title: '保険代理店・金融商品の副業事情｜必要な資格と収益モデル',
    description:
      '保険・投資・カードなど金融系代理店はストック収益の代表格。副業で始めるために必要な資格、収益モデル、注意点を解説します。',
    category: 'industry',
    tags: ['保険 代理店', '金融 副業', 'ストック収益', '募集人資格'],
    publishedAt: '2026-10-10',
    readingMinutes: 12,
  },
  {
    slug: 'food-franchise',
    title: '飲食フランチャイズ加盟のリアル｜失敗しないチェックポイント',
    description:
      'カフェ・居酒屋・ラーメン・コンビニなど飲食FCは独立の王道。一方で撤退率も高い分野です。初期投資、メリット・デメリット、失敗しないコツを解説。',
    category: 'industry',
    tags: ['飲食 FC', 'フランチャイズ 加盟', 'カフェ 開業', '独立'],
    publishedAt: '2026-10-10',
    readingMinutes: 12,
  },
  {
    slug: 'agent-contract-checklist',
    title: '代理店契約前に確認すべき5つのポイント',
    description:
      '代理店契約は、ビジネスの土台を作る契約。報酬体系・費用・契約期間・業務範囲・サポート体制——サイン前に必ず確認したい5つのポイントを解説します。',
    category: 'know-how',
    tags: ['代理店 契約', '契約書', 'チェックリスト', '注意点'],
    publishedAt: '2026-10-10',
    readingMinutes: 10,
  },
  {
    slug: 'referral-agent',
    title: '紹介型代理店で稼ぐ仕組み｜在庫も店舗も不要のビジネス',
    description:
      '商品を持たない、店舗も持たない、在庫も抱えない。もっとも参入しやすい紹介型代理店の仕組みと、実際に稼ぐ方法を解説します。',
    category: 'agent',
    tags: ['紹介 代理店', '紹介ビジネス', '副業', '在宅'],
    publishedAt: '2026-10-10',
    readingMinutes: 10,
  },
  {
    slug: 'work-from-home-agent',
    title: '在宅でできる代理店・加盟店｜完全在宅で稼ぐ方法',
    description:
      '通勤から解放される在宅型の代理店・加盟店。種類、メリット・デメリット、稼ぐためのコツを、初心者向けにわかりやすく解説します。',
    category: 'agent',
    tags: ['在宅 代理店', '在宅 副業', 'リモートワーク', '在宅ワーク'],
    publishedAt: '2026-10-10',
    readingMinutes: 11,
  },
  {
    slug: 'agent-vs-outsourcing',
    title: '代理店と業務委託の違い｜どちらを選ぶべきか',
    description:
      '「代理店」と「業務委託」は似て非なるもの。立場・報酬・自由度・法的扱いの違いを整理し、自分に合う方を判断できるように解説します。',
    category: 'comparison',
    tags: ['代理店 業務委託 違い', '業務委託', 'フリーランス', '比較'],
    publishedAt: '2026-10-10',
    readingMinutes: 10,
  },
  {
    slug: 'agent-vs-affiliate',
    title: '代理店とアフィリエイトの違い｜どちらが稼げるか',
    description:
      '代理店とアフィリエイトは、報酬の仕組みが根本的に違います。契約先・報酬単価・集客方法を比較し、自分に向いている方を解説します。',
    category: 'comparison',
    tags: ['代理店 アフィリエイト 違い', 'アフィリエイト', '副業', '比較'],
    publishedAt: '2026-10-10',
    readingMinutes: 11,
  },
  {
    slug: 'resale-vs-agent',
    title: '転売・せどりと代理店、どちらが稼げるか',
    description:
      '「副業で稼ぐ」の代表格、転売・せどりと代理店を徹底比較。在庫リスク、初期費用、収益モデル、法規制の違いを中立に解説します。',
    category: 'comparison',
    tags: ['転売 代理店 比較', 'せどり', '副業', '在庫リスク'],
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
