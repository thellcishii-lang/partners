// functions/seed-masters.mjs
// 実行: node scripts/seed-masters.mjs
// 前提: エミュレータ起動中、または本番の認証情報が通っていること
//
// エミュレータ:
//   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 GCLOUD_PROJECT=demo-partners node scripts/seed-masters.mjs
// 本番:
//   GCLOUD_PROJECT=partners-ab2a3 node scripts/seed-masters.mjs

import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (getApps().length === 0) {
  initializeApp();
}
const db = getFirestore();

const now = new Date();

// ============================================================
// categories（3軸: target / product / model）
// ============================================================
const categories = [
  // ───── 【軸1】ターゲット（誰向けか） ─────
  { slug: 'target-general',      axis: 'target', label: '一般企業',           parentSlug: null, order: 10,
    seoTitle: '一般企業向けの代理店募集',
    seoDescription: '一般企業向けの商材を扱う代理店・加盟店を募集している企業の一覧です。' },
  { slug: 'target-retail',       axis: 'target', label: '小売・店舗ビジネス', parentSlug: null, order: 20,
    seoTitle: '小売・店舗ビジネス向けの代理店募集',
    seoDescription: '小売・店舗ビジネス向けの商材を扱う代理店・加盟店の募集一覧です。' },
  { slug: 'target-hospitality',  axis: 'target', label: '宿泊・レジャー・娯楽', parentSlug: null, order: 30,
    seoTitle: '宿泊・レジャー・娯楽向けの代理店募集',
    seoDescription: '宿泊業・レジャー施設・娯楽業向けの商材を扱う代理店の募集一覧です。' },
  { slug: 'target-education',    axis: 'target', label: '教育・スクール',     parentSlug: null, order: 40,
    seoTitle: '教育・スクール向けの代理店募集',
    seoDescription: '学習塾・資格スクール・英会話など教育業向けの代理店募集一覧です。' },
  { slug: 'target-medical',      axis: 'target', label: '医療・衛生・ヘルスケア', parentSlug: null, order: 50,
    seoTitle: '医療・衛生・ヘルスケア向けの代理店募集',
    seoDescription: '医療機関・衛生業・ヘルスケア業向けの商材を扱う代理店の募集一覧です。' },
  { slug: 'target-public',       axis: 'target', label: '公共・大型施設',     parentSlug: null, order: 60,
    seoTitle: '公共・大型施設向けの代理店募集',
    seoDescription: '公共施設・大型商業施設向けの商材を扱う代理店の募集一覧です。' },
  { slug: 'target-professional', axis: 'target', label: '士業・専門サービス', parentSlug: null, order: 70,
    seoTitle: '士業・専門サービス向けの代理店募集',
    seoDescription: '弁護士・税理士・社労士など士業向けの代理店募集一覧です。' },
  { slug: 'target-individual',   axis: 'target', label: '個人',               parentSlug: null, order: 80,
    seoTitle: '個人向けの代理店募集',
    seoDescription: '個人のお客様向け商材を扱う代理店・業務提携の募集一覧です。' },

  // ───── 【軸2】商材（何を扱うか） ─────
  // 大分類
  { slug: 'product-ai-it',      axis: 'product', label: 'AI / IT / DX / SaaS', parentSlug: null, order: 10,
    seoTitle: 'AI・IT・DX・SaaSの代理店募集',
    seoDescription: 'AI・IT・DX・SaaS商材の代理店を募集している企業の一覧です。' },
  { slug: 'product-telecom',    axis: 'product', label: '通信 / 携帯 / 光回線', parentSlug: null, order: 20,
    seoTitle: '通信・携帯・光回線の代理店募集',
    seoDescription: '携帯キャリア・光回線など通信商材の代理店募集一覧です。' },
  { slug: 'product-marketing',  axis: 'product', label: '広告 / 集客 / Web制作', parentSlug: null, order: 30,
    seoTitle: '広告・集客・Web制作の代理店募集',
    seoDescription: '広告代理店・SEO・Web制作など集客商材の代理店募集一覧です。' },
  { slug: 'product-housing',    axis: 'product', label: '住宅・エネルギー',   parentSlug: null, order: 40,
    seoTitle: '住宅・エネルギーの代理店募集',
    seoDescription: '太陽光・リフォーム・外構など住宅関連商材の代理店募集一覧です。' },
  { slug: 'product-finance',    axis: 'product', label: '金融・保険',         parentSlug: null, order: 50,
    seoTitle: '金融・保険の代理店募集',
    seoDescription: '保険・ローン・投資など金融商材の代理店募集一覧です。' },
  { slug: 'product-beauty',     axis: 'product', label: '美容 / 健康',        parentSlug: null, order: 60,
    seoTitle: '美容・健康商材の代理店募集',
    seoDescription: 'エステ・ネイル・健康食品など美容・健康商材の代理店募集一覧です。' },
  { slug: 'product-food',       axis: 'product', label: '飲料 / 食品',        parentSlug: null, order: 70,
    seoTitle: '飲料・食品の代理店募集',
    seoDescription: '飲料・食品・健康食品など食品商材の代理店募集一覧です。' },
  { slug: 'product-other',      axis: 'product', label: 'その他商材',         parentSlug: null, order: 80,
    seoTitle: 'その他商材の代理店募集',
    seoDescription: '上記カテゴリに該当しない商材の代理店募集一覧です。' },

  // AI / IT サブ
  { slug: 'product-ai',        axis: 'product', label: 'AI',           parentSlug: 'product-ai-it', order: 11,
    seoTitle: 'AI商材の代理店募集', seoDescription: 'AI商材の代理店募集一覧です。' },
  { slug: 'product-dx',        axis: 'product', label: 'DX',           parentSlug: 'product-ai-it', order: 12,
    seoTitle: 'DX商材の代理店募集', seoDescription: 'DX支援商材の代理店募集一覧です。' },
  { slug: 'product-saas',      axis: 'product', label: 'SaaS',         parentSlug: 'product-ai-it', order: 13,
    seoTitle: 'SaaSの代理店募集',   seoDescription: 'SaaS商材の代理店募集一覧です。' },
  { slug: 'product-iot',       axis: 'product', label: 'IoT',          parentSlug: 'product-ai-it', order: 14,
    seoTitle: 'IoTの代理店募集',    seoDescription: 'IoT商材の代理店募集一覧です。' },
  { slug: 'product-security',  axis: 'product', label: 'セキュリティ', parentSlug: 'product-ai-it', order: 15,
    seoTitle: 'セキュリティ商材の代理店募集', seoDescription: '情報セキュリティ商材の代理店募集一覧です。' },

  // 通信 サブ
  { slug: 'product-mobile',         axis: 'product', label: '携帯キャリア',   parentSlug: 'product-telecom', order: 21,
    seoTitle: '携帯キャリアの代理店募集', seoDescription: '携帯キャリア商材の代理店募集一覧です。' },
  { slug: 'product-hikari',         axis: 'product', label: '光回線',         parentSlug: 'product-telecom', order: 22,
    seoTitle: '光回線の代理店募集', seoDescription: '光回線商材の代理店募集一覧です。' },
  { slug: 'product-corporate-line', axis: 'product', label: '法人回線',       parentSlug: 'product-telecom', order: 23,
    seoTitle: '法人回線の代理店募集', seoDescription: '法人向け通信回線の代理店募集一覧です。' },

  // マーケティング サブ
  { slug: 'product-ad',              axis: 'product', label: '広告',           parentSlug: 'product-marketing', order: 31,
    seoTitle: '広告の代理店募集', seoDescription: '広告商材の代理店募集一覧です。' },
  { slug: 'product-seo',             axis: 'product', label: 'SEO',            parentSlug: 'product-marketing', order: 32,
    seoTitle: 'SEOの代理店募集', seoDescription: 'SEO商材の代理店募集一覧です。' },
  { slug: 'product-web-production',  axis: 'product', label: 'Web制作',        parentSlug: 'product-marketing', order: 33,
    seoTitle: 'Web制作の代理店募集', seoDescription: 'Web制作の代理店募集一覧です。' },
  { slug: 'product-sns',             axis: 'product', label: 'SNS運用',        parentSlug: 'product-marketing', order: 34,
    seoTitle: 'SNS運用の代理店募集', seoDescription: 'SNS運用代行の代理店募集一覧です。' },

  // 住宅 サブ
  { slug: 'product-solar',    axis: 'product', label: '太陽光・蓄電池', parentSlug: 'product-housing', order: 41,
    seoTitle: '太陽光・蓄電池の代理店募集', seoDescription: '太陽光発電・蓄電池の代理店募集一覧です。' },
  { slug: 'product-reform',   axis: 'product', label: 'リフォーム',     parentSlug: 'product-housing', order: 42,
    seoTitle: 'リフォームの代理店募集', seoDescription: 'リフォーム商材の代理店募集一覧です。' },
  { slug: 'product-exterior', axis: 'product', label: '外構',           parentSlug: 'product-housing', order: 43,
    seoTitle: '外構の代理店募集', seoDescription: '外構工事の代理店募集一覧です。' },
  { slug: 'product-electric', axis: 'product', label: '電気・ガス',     parentSlug: 'product-housing', order: 44,
    seoTitle: '電気・ガスの代理店募集', seoDescription: '電力・ガス自由化に伴う代理店募集一覧です。' },

  // 金融 サブ
  { slug: 'product-insurance', axis: 'product', label: '保険',   parentSlug: 'product-finance', order: 51,
    seoTitle: '保険の代理店募集', seoDescription: '生命保険・損害保険の代理店募集一覧です。' },
  { slug: 'product-loan',      axis: 'product', label: 'ローン', parentSlug: 'product-finance', order: 52,
    seoTitle: 'ローンの代理店募集', seoDescription: '各種ローンの代理店募集一覧です。' },
  { slug: 'product-investment',axis: 'product', label: '投資',   parentSlug: 'product-finance', order: 53,
    seoTitle: '投資商材の代理店募集', seoDescription: '投資関連商材の代理店募集一覧です。' },

  // 美容 サブ
  { slug: 'product-este',         axis: 'product', label: 'エステ',   parentSlug: 'product-beauty', order: 61,
    seoTitle: 'エステの加盟店募集', seoDescription: 'エステサロンの加盟店募集一覧です。' },
  { slug: 'product-nail',         axis: 'product', label: 'ネイル',   parentSlug: 'product-beauty', order: 62,
    seoTitle: 'ネイルサロンの加盟店募集', seoDescription: 'ネイルサロンの加盟店募集一覧です。' },
  { slug: 'product-hair-salon',   axis: 'product', label: '美容室',   parentSlug: 'product-beauty', order: 63,
    seoTitle: '美容室の加盟店募集', seoDescription: '美容室・ヘアサロンの加盟店募集一覧です。' },
  { slug: 'product-hair-removal', axis: 'product', label: '脱毛',     parentSlug: 'product-beauty', order: 64,
    seoTitle: '脱毛サロンの加盟店募集', seoDescription: '脱毛サロンの加盟店募集一覧です。' },
  { slug: 'product-supplement',   axis: 'product', label: 'サプリ',   parentSlug: 'product-beauty', order: 65,
    seoTitle: 'サプリメントの代理店募集', seoDescription: 'サプリメント商材の代理店募集一覧です。' },

  // 食品 サブ
  { slug: 'product-beverage',    axis: 'product', label: '飲料',     parentSlug: 'product-food', order: 71,
    seoTitle: '飲料の代理店募集', seoDescription: '飲料商材の代理店募集一覧です。' },
  { slug: 'product-food-stuff',  axis: 'product', label: '食品',     parentSlug: 'product-food', order: 72,
    seoTitle: '食品の代理店募集', seoDescription: '食品商材の代理店募集一覧です。' },
  { slug: 'product-health-food', axis: 'product', label: '健康食品', parentSlug: 'product-food', order: 73,
    seoTitle: '健康食品の代理店募集', seoDescription: '健康食品商材の代理店募集一覧です。' },

  // ───── 【軸3】ビジネスモデル / 探し方 ─────
  { slug: 'model-low-risk',       axis: 'model', label: '簡単・低リスクで始める', parentSlug: null, order: 10,
    seoTitle: '初期費用無料・低リスクの代理店募集',
    seoDescription: '在庫リスクなし・初期費用無料など、低リスクで始められる代理店募集一覧です。' },
  { slug: 'model-high-reward',    axis: 'model', label: '報酬単価が高い',         parentSlug: null, order: 20,
    seoTitle: '高単価・高報酬の代理店募集',
    seoDescription: '1件あたりの報酬単価が高い代理店募集一覧です。' },
  { slug: 'model-side-business',  axis: 'model', label: '副業・スモールスタート', parentSlug: null, order: 30,
    seoTitle: '副業・スモールスタート可能な代理店募集',
    seoDescription: '本業の傍ら副業として始められる代理店募集一覧です。' },
  { slug: 'model-women-friendly', axis: 'model', label: '女性に人気',             parentSlug: null, order: 40,
    seoTitle: '女性に人気の代理店募集',
    seoDescription: '女性の代理店オーナーが多い、または女性向け商材の代理店募集一覧です。' },
  { slug: 'model-public-support', axis: 'model', label: '公的支援・補助金活用',   parentSlug: null, order: 50,
    seoTitle: '公的支援・補助金が使える代理店募集',
    seoDescription: '補助金・助成金を活用できる代理店募集一覧です。' },
  { slug: 'model-franchise',      axis: 'model', label: 'フランチャイズ加盟',     parentSlug: null, order: 60,
    seoTitle: 'フランチャイズ加盟店募集',
    seoDescription: 'フランチャイズ（FC）加盟店を募集している企業の一覧です。' },
  { slug: 'model-sales-agent',    axis: 'model', label: '販売代理店',             parentSlug: null, order: 70,
    seoTitle: '販売代理店募集',
    seoDescription: '商材の販売代理店を募集している企業の一覧です。' },
  { slug: 'model-referral',       axis: 'model', label: '紹介代理店',             parentSlug: null, order: 80,
    seoTitle: '紹介代理店募集',
    seoDescription: '顧客紹介型の代理店を募集している企業の一覧です。' },
].map((c) => ({ ...c, isActive: true, createdAt: now, updatedAt: now }));

// ============================================================
// areas（地域マスタ）
// ============================================================
const regions = [
  { slug: 'hokkaido', label: '北海道',    prefectures: ['hokkaido'] },
  { slug: 'tohoku',   label: '東北',      prefectures: ['aomori', 'iwate', 'miyagi', 'akita', 'yamagata', 'fukushima'] },
  { slug: 'kanto',    label: '関東',      prefectures: ['tokyo', 'kanagawa', 'saitama', 'chiba', 'ibaraki', 'tochigi', 'gunma'] },
  { slug: 'chubu',    label: '中部',      prefectures: ['niigata', 'toyama', 'ishikawa', 'fukui', 'yamanashi', 'nagano', 'gifu', 'shizuoka', 'aichi'] },
  { slug: 'kansai',   label: '関西',      prefectures: ['mie', 'shiga', 'kyoto', 'osaka', 'hyogo', 'nara', 'wakayama'] },
  { slug: 'chugoku',  label: '中国',      prefectures: ['tottori', 'shimane', 'okayama', 'hiroshima', 'yamaguchi'] },
  { slug: 'shikoku',  label: '四国',      prefectures: ['tokushima', 'kagawa', 'ehime', 'kochi'] },
  { slug: 'kyushu',   label: '九州・沖縄', prefectures: ['fukuoka', 'saga', 'nagasaki', 'kumamoto', 'oita', 'miyazaki', 'kagoshima', 'okinawa'] },
];

const prefectures = [
  { slug: 'hokkaido', label: '北海道',   region: 'hokkaido' },
  { slug: 'aomori',   label: '青森県',   region: 'tohoku' },
  { slug: 'iwate',    label: '岩手県',   region: 'tohoku' },
  { slug: 'miyagi',   label: '宮城県',   region: 'tohoku' },
  { slug: 'akita',    label: '秋田県',   region: 'tohoku' },
  { slug: 'yamagata', label: '山形県',   region: 'tohoku' },
  { slug: 'fukushima',label: '福島県',   region: 'tohoku' },
  { slug: 'tokyo',    label: '東京都',   region: 'kanto' },
  { slug: 'kanagawa', label: '神奈川県', region: 'kanto' },
  { slug: 'saitama',  label: '埼玉県',   region: 'kanto' },
  { slug: 'chiba',    label: '千葉県',   region: 'kanto' },
  { slug: 'ibaraki',  label: '茨城県',   region: 'kanto' },
  { slug: 'tochigi',  label: '栃木県',   region: 'kanto' },
  { slug: 'gunma',    label: '群馬県',   region: 'kanto' },
  { slug: 'niigata',  label: '新潟県',   region: 'chubu' },
  { slug: 'toyama',   label: '富山県',   region: 'chubu' },
  { slug: 'ishikawa', label: '石川県',   region: 'chubu' },
  { slug: 'fukui',    label: '福井県',   region: 'chubu' },
  { slug: 'yamanashi',label: '山梨県',   region: 'chubu' },
  { slug: 'nagano',   label: '長野県',   region: 'chubu' },
  { slug: 'gifu',     label: '岐阜県',   region: 'chubu' },
  { slug: 'shizuoka', label: '静岡県',   region: 'chubu' },
  { slug: 'aichi',    label: '愛知県',   region: 'chubu' },
  { slug: 'mie',      label: '三重県',   region: 'kansai' },
  { slug: 'shiga',    label: '滋賀県',   region: 'kansai' },
  { slug: 'kyoto',    label: '京都府',   region: 'kansai' },
  { slug: 'osaka',    label: '大阪府',   region: 'kansai' },
  { slug: 'hyogo',    label: '兵庫県',   region: 'kansai' },
  { slug: 'nara',     label: '奈良県',   region: 'kansai' },
  { slug: 'wakayama', label: '和歌山県', region: 'kansai' },
  { slug: 'tottori',  label: '鳥取県',   region: 'chugoku' },
  { slug: 'shimane',  label: '島根県',   region: 'chugoku' },
  { slug: 'okayama',  label: '岡山県',   region: 'chugoku' },
  { slug: 'hiroshima',label: '広島県',   region: 'chugoku' },
  { slug: 'yamaguchi',label: '山口県',   region: 'chugoku' },
  { slug: 'tokushima',label: '徳島県',   region: 'shikoku' },
  { slug: 'kagawa',   label: '香川県',   region: 'shikoku' },
  { slug: 'ehime',    label: '愛媛県',   region: 'shikoku' },
  { slug: 'kochi',    label: '高知県',   region: 'shikoku' },
  { slug: 'fukuoka',  label: '福岡県',   region: 'kyushu' },
  { slug: 'saga',     label: '佐賀県',   region: 'kyushu' },
  { slug: 'nagasaki', label: '長崎県',   region: 'kyushu' },
  { slug: 'kumamoto', label: '熊本県',   region: 'kyushu' },
  { slug: 'oita',     label: '大分県',   region: 'kyushu' },
  { slug: 'miyazaki', label: '宮崎県',   region: 'kyushu' },
  { slug: 'kagoshima',label: '鹿児島県', region: 'kyushu' },
  { slug: 'okinawa',  label: '沖縄県',   region: 'kyushu' },
];

const areas = [
  ...regions.map((r, i) => ({
    slug: r.slug,
    label: r.label,
    type: 'region',
    parentSlug: null,
    prefectures: r.prefectures,
    order: (i + 1) * 10,
    seoTitle: `${r.label}の代理店・加盟店募集`,
    seoDescription: `${r.label}エリアの代理店・加盟店を募集している企業の一覧です。`,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  })),
  ...prefectures.map((p, i) => ({
    slug: p.slug,
    label: p.label,
    type: 'prefecture',
    parentSlug: p.region,
    prefectures: [],
    order: (i + 1) * 10,
    seoTitle: `${p.label}の代理店・加盟店募集`,
    seoDescription: `${p.label}の代理店・加盟店を募集している企業の一覧です。`,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  })),
];

// ============================================================
// costRanges（費用レンジ）
// ============================================================
const costRanges = [
  // 初期費用
  { slug: 'initial-free',     label: '初期費用無料',  type: 'initial_cost', min: 0,         max: 0,          order: 10,
    seoTitle: '初期費用無料の代理店募集', isActive: true },
  { slug: 'initial-under100', label: '100万円以下',   type: 'initial_cost', min: 1,         max: 1_000_000,  order: 20,
    seoTitle: '初期費用100万円以下の代理店募集', isActive: true },
  { slug: 'initial-under300', label: '300万円以下',   type: 'initial_cost', min: 1_000_001, max: 3_000_000,  order: 30,
    seoTitle: '初期費用300万円以下の代理店募集', isActive: true },
  { slug: 'initial-over300',  label: '300万円以上',   type: 'initial_cost', min: 3_000_001, max: null,       order: 40,
    seoTitle: '初期費用300万円以上の代理店募集', isActive: true },
  { slug: 'initial-unknown',  label: '応相談',        type: 'initial_cost', min: -1,        max: null,       order: 50,
    seoTitle: '初期費用応相談の代理店募集', isActive: true },

  // 想定売上（年商）
  { slug: 'revenue-under300',  label: '年商300万円以下',  type: 'expected_revenue', min: 0,          max: 3_000_000,  order: 10,
    seoTitle: '年商300万円以下の代理店募集', isActive: true },
  { slug: 'revenue-under500',  label: '年商500万円以下',  type: 'expected_revenue', min: 3_000_001,  max: 5_000_000,  order: 20,
    seoTitle: '年商500万円以下の代理店募集', isActive: true },
  { slug: 'revenue-under1000', label: '年商1000万円以下', type: 'expected_revenue', min: 5_000_001,  max: 10_000_000, order: 30,
    seoTitle: '年商1000万円以下の代理店募集', isActive: true },
  { slug: 'revenue-over1000',  label: '年商1000万円以上', type: 'expected_revenue', min: 10_000_001, max: null,       order: 40,
    seoTitle: '年商1000万円以上の代理店募集', isActive: true },
  { slug: 'revenue-unknown',   label: '応相談',           type: 'expected_revenue', min: -1,         max: null,       order: 50,
    seoTitle: '年商応相談の代理店募集', isActive: true },
].map((c) => ({ ...c, createdAt: now, updatedAt: now }));

// ============================================================
// 投入
// ============================================================
async function seed() {
  console.log('Seeding masters...');

  // ドキュメント数が多いので、500件ずつバッチ
  const BATCH_SIZE = 400;

  async function commitAll(collectionName, items) {
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const batch = db.batch();
      for (const item of items.slice(i, i + BATCH_SIZE)) {
        batch.set(db.collection(collectionName).doc(item.slug), item, { merge: true });
      }
      await batch.commit();
    }
  }

  await commitAll('categories', categories);
  await commitAll('areas', areas);
  await commitAll('costRanges', costRanges);

  console.log(`✓ categories: ${categories.length}件`);
  console.log(`   - target:  ${categories.filter((c) => c.axis === 'target').length}`);
  console.log(`   - product: ${categories.filter((c) => c.axis === 'product').length}`);
  console.log(`   - model:   ${categories.filter((c) => c.axis === 'model').length}`);
  console.log(`✓ areas: ${areas.length}件`);
  console.log(`   - region:     ${areas.filter((a) => a.type === 'region').length}`);
  console.log(`   - prefecture: ${areas.filter((a) => a.type === 'prefecture').length}`);
  console.log(`✓ costRanges: ${costRanges.length}件`);
  console.log('Done.');
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
