// ============================================================
// スラッグ → ラベル の静的マップ
// functions/seed-masters.mjs と同期させること
// ============================================================

export const TARGET_LABELS: Record<string, string> = {
  'target-general': '一般企業',
  'target-retail': '小売・店舗ビジネス',
  'target-hospitality': '宿泊・レジャー・娯楽',
  'target-education': '教育・スクール',
  'target-medical': '医療・衛生・ヘルスケア',
  'target-public': '公共・大型施設',
  'target-professional': '士業・専門サービス',
  'target-individual': '個人',
};

export const PRODUCT_LABELS: Record<string, string> = {
  'product-ai-it': 'AI / IT / DX / SaaS',
  'product-telecom': '通信 / 携帯 / 光回線',
  'product-marketing': '広告 / 集客 / Web制作',
  'product-housing': '住宅・エネルギー',
  'product-finance': '金融・保険',
  'product-beauty': '美容 / 健康',
  'product-food': '飲料 / 食品',
  'product-other': 'その他商材',
  'product-ai': 'AI',
  'product-dx': 'DX',
  'product-saas': 'SaaS',
  'product-iot': 'IoT',
  'product-security': 'セキュリティ',
  'product-mobile': '携帯キャリア',
  'product-hikari': '光回線',
  'product-corporate-line': '法人回線',
  'product-ad': '広告',
  'product-seo': 'SEO',
  'product-web-production': 'Web制作',
  'product-sns': 'SNS運用',
  'product-solar': '太陽光・蓄電池',
  'product-reform': 'リフォーム',
  'product-exterior': '外構',
  'product-electric': '電気・ガス',
  'product-insurance': '保険',
  'product-loan': 'ローン',
  'product-investment': '投資',
  'product-este': 'エステ',
  'product-nail': 'ネイル',
  'product-hair-salon': '美容室',
  'product-hair-removal': '脱毛',
  'product-supplement': 'サプリ',
  'product-beverage': '飲料',
  'product-food-stuff': '食品',
  'product-health-food': '健康食品',
};

export const MODEL_LABELS: Record<string, string> = {
  'model-low-risk': '簡単・低リスクで始める',
  'model-high-reward': '報酬単価が高い',
  'model-side-business': '副業・スモールスタート',
  'model-women-friendly': '女性に人気',
  'model-public-support': '公的支援・補助金活用',
  'model-franchise': 'フランチャイズ加盟',
  'model-sales-agent': '販売代理店',
  'model-referral': '紹介代理店',
};

export interface AreaInfo {
  label: string;
  type: 'region' | 'prefecture';
}

export const AREA_LABELS: Record<string, AreaInfo> = {
  // region
  hokkaido: { label: '北海道', type: 'region' },
  tohoku: { label: '東北', type: 'region' },
  kanto: { label: '関東', type: 'region' },
  chubu: { label: '中部', type: 'region' },
  kansai: { label: '関西', type: 'region' },
  chugoku: { label: '中国', type: 'region' },
  shikoku: { label: '四国', type: 'region' },
  kyushu: { label: '九州・沖縄', type: 'region' },
  // prefecture
  aomori: { label: '青森県', type: 'prefecture' },
  iwate: { label: '岩手県', type: 'prefecture' },
  miyagi: { label: '宮城県', type: 'prefecture' },
  akita: { label: '秋田県', type: 'prefecture' },
  yamagata: { label: '山形県', type: 'prefecture' },
  fukushima: { label: '福島県', type: 'prefecture' },
  tokyo: { label: '東京都', type: 'prefecture' },
  kanagawa: { label: '神奈川県', type: 'prefecture' },
  saitama: { label: '埼玉県', type: 'prefecture' },
  chiba: { label: '千葉県', type: 'prefecture' },
  ibaraki: { label: '茨城県', type: 'prefecture' },
  tochigi: { label: '栃木県', type: 'prefecture' },
  gunma: { label: '群馬県', type: 'prefecture' },
  niigata: { label: '新潟県', type: 'prefecture' },
  toyama: { label: '富山県', type: 'prefecture' },
  ishikawa: { label: '石川県', type: 'prefecture' },
  fukui: { label: '福井県', type: 'prefecture' },
  yamanashi: { label: '山梨県', type: 'prefecture' },
  nagano: { label: '長野県', type: 'prefecture' },
  gifu: { label: '岐阜県', type: 'prefecture' },
  shizuoka: { label: '静岡県', type: 'prefecture' },
  aichi: { label: '愛知県', type: 'prefecture' },
  mie: { label: '三重県', type: 'prefecture' },
  shiga: { label: '滋賀県', type: 'prefecture' },
  kyoto: { label: '京都府', type: 'prefecture' },
  osaka: { label: '大阪府', type: 'prefecture' },
  hyogo: { label: '兵庫県', type: 'prefecture' },
  nara: { label: '奈良県', type: 'prefecture' },
  wakayama: { label: '和歌山県', type: 'prefecture' },
  tottori: { label: '鳥取県', type: 'prefecture' },
  shimane: { label: '島根県', type: 'prefecture' },
  okayama: { label: '岡山県', type: 'prefecture' },
  hiroshima: { label: '広島県', type: 'prefecture' },
  yamaguchi: { label: '山口県', type: 'prefecture' },
  tokushima: { label: '徳島県', type: 'prefecture' },
  kagawa: { label: '香川県', type: 'prefecture' },
  ehime: { label: '愛媛県', type: 'prefecture' },
  kochi: { label: '高知県', type: 'prefecture' },
  fukuoka: { label: '福岡県', type: 'prefecture' },
  saga: { label: '佐賀県', type: 'prefecture' },
  nagasaki: { label: '長崎県', type: 'prefecture' },
  kumamoto: { label: '熊本県', type: 'prefecture' },
  oita: { label: '大分県', type: 'prefecture' },
  miyazaki: { label: '宮崎県', type: 'prefecture' },
  kagoshima: { label: '鹿児島県', type: 'prefecture' },
  okinawa: { label: '沖縄県', type: 'prefecture' },
};

export const INITIAL_COST_LABELS: Record<string, string> = {
  'initial-free': '初期費用無料',
  'initial-under100': '100万円以下',
  'initial-under300': '300万円以下',
  'initial-over300': '300万円以上',
  'initial-unknown': '応相談',
};

// ============================================================
// ヘルパー
// ============================================================
export function getCategoryLabel(slug: string): string {
  return (
    TARGET_LABELS[slug] ??
    PRODUCT_LABELS[slug] ??
    MODEL_LABELS[slug] ??
    slug
  );
}

export function getAreaLabel(slug: string): string | null {
  return AREA_LABELS[slug]?.label ?? null;
}

export function getAreaType(slug: string): 'region' | 'prefecture' | null {
  return AREA_LABELS[slug]?.type ?? null;
}

export function getInitialCostLabel(slug: string): string | null {
  return INITIAL_COST_LABELS[slug] ?? null;
}
