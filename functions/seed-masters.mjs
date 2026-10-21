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

  // ───── 【飲食店特化】 ─────
  { slug: 'eat-cafe',     axis: 'target', industry: 'eat', label: 'カフェ・喫茶店',             parentSlug: null, order: 110, seoTitle: 'カフェ・喫茶店の代理店・加盟店募集', seoDescription: 'カフェ・喫茶店向けの代理店・加盟店募集一覧です。' },
  { slug: 'eat-izakaya',  axis: 'target', industry: 'eat', label: '居酒屋・バー',               parentSlug: null, order: 120, seoTitle: '居酒屋・バーの代理店・加盟店募集', seoDescription: '居酒屋・バー向けの代理店・加盟店募集一覧です。' },
  { slug: 'eat-diner',    axis: 'target', industry: 'eat', label: '定食・食堂',                 parentSlug: null, order: 130, seoTitle: '定食・食堂の代理店・加盟店募集', seoDescription: '定食屋・食堂向けの代理店・加盟店募集一覧です。' },
  { slug: 'eat-noodle',   axis: 'target', industry: 'eat', label: 'ラーメン・麺類',             parentSlug: null, order: 140, seoTitle: 'ラーメン・麺類の代理店・加盟店募集', seoDescription: 'ラーメン店・麺類店向けの代理店・加盟店募集一覧です。' },
  { slug: 'eat-fastfood', axis: 'target', industry: 'eat', label: 'ファストフード・テイクアウト', parentSlug: null, order: 150, seoTitle: 'ファストフード・テイクアウトの代理店・加盟店募集', seoDescription: 'ファストフード・テイクアウト向けの代理店・加盟店募集一覧です。' },
  { slug: 'eat-ryotei',   axis: 'target', industry: 'eat', label: '料亭・割烹',                 parentSlug: null, order: 160, seoTitle: '料亭・割烹の代理店・加盟店募集', seoDescription: '料亭・割烹向けの代理店・加盟店募集一覧です。' },
  { slug: 'eat-other',    axis: 'target', industry: 'eat', label: 'その他飲食',                 parentSlug: null, order: 170, seoTitle: 'その他飲食の代理店・加盟店募集', seoDescription: 'その他の飲食業態向けの代理店・加盟店募集一覧です。' },

  { slug: 'eat-product-pos',      axis: 'product', industry: 'eat', label: 'POSレジ・キャッシュレス', parentSlug: null, order: 110, seoTitle: '飲食店向けPOSレジ・キャッシュレスの代理店募集', seoDescription: '飲食店向けPOSレジ・キャッシュレス商材の代理店募集一覧です。' },
  { slug: 'eat-product-crm',      axis: 'product', industry: 'eat', label: '顧客管理・予約システム',   parentSlug: null, order: 120, seoTitle: '飲食店向け顧客管理・予約システムの代理店募集', seoDescription: '飲食店向け顧客管理・予約システム商材の代理店募集一覧です。' },
  { slug: 'eat-product-food',     axis: 'product', industry: 'eat', label: '食材・仕入れ',             parentSlug: null, order: 130, seoTitle: '飲食店向け食材・仕入れの代理店募集', seoDescription: '飲食店向け食材・仕入れ商材の代理店募集一覧です。' },
  { slug: 'eat-product-delivery', axis: 'product', industry: 'eat', label: '集客・デリバリー',         parentSlug: null, order: 140, seoTitle: '飲食店向け集客・デリバリーの代理店募集', seoDescription: '飲食店向け集客・デリバリー商材の代理店募集一覧です。' },
  { slug: 'eat-product-equip',    axis: 'product', industry: 'eat', label: '店舗設備・リフォーム',     parentSlug: null, order: 150, seoTitle: '飲食店向け店舗設備・リフォームの代理店募集', seoDescription: '飲食店向け店舗設備・リフォーム商材の代理店募集一覧です。' },
  { slug: 'eat-product-other',    axis: 'product', industry: 'eat', label: 'その他飲食向け商材',       parentSlug: null, order: 160, seoTitle: 'その他飲食向け商材の代理店募集', seoDescription: 'その他飲食店向け商材の代理店募集一覧です。' },

  // ───── 【美容・エステ特化】 ─────
  { slug: 'beauty-hair',  axis: 'target', industry: 'beauty', label: '美容室・ヘアサロン', parentSlug: null, order: 210, seoTitle: '美容室・ヘアサロンの代理店募集', seoDescription: '美容室・ヘアサロン向けの代理店募集一覧です。' },
  { slug: 'beauty-esthe', axis: 'target', industry: 'beauty', label: 'エステ・脱毛サロン', parentSlug: null, order: 220, seoTitle: 'エステ・脱毛サロンの代理店募集', seoDescription: 'エステ・脱毛サロン向けの代理店募集一覧です。' },
  { slug: 'beauty-nail',  axis: 'target', industry: 'beauty', label: 'ネイル・まつげサロン', parentSlug: null, order: 230, seoTitle: 'ネイル・まつげサロンの代理店募集', seoDescription: 'ネイル・まつげサロン向けの代理店募集一覧です。' },
  { slug: 'beauty-relax', axis: 'target', industry: 'beauty', label: 'リラクゼーション・整体', parentSlug: null, order: 240, seoTitle: 'リラクゼーション・整体の代理店募集', seoDescription: 'リラクゼーション・整体向けの代理店募集一覧です。' },
  { slug: 'beauty-other', axis: 'target', industry: 'beauty', label: 'その他美容業態', parentSlug: null, order: 250, seoTitle: 'その他美容業態の代理店募集', seoDescription: 'その他美容業態向けの代理店募集一覧です。' },

  { slug: 'beauty-product-crm',       axis: 'product', industry: 'beauty', label: '予約システム・顧客管理', parentSlug: null, order: 210, seoTitle: '美容向け予約システムの代理店募集', seoDescription: '美容サロン向け予約システム・顧客管理商材の代理店募集一覧です。' },
  { slug: 'beauty-product-machine',   axis: 'product', industry: 'beauty', label: '美容機器・脱毛機', parentSlug: null, order: 220, seoTitle: '美容機器・脱毛機の代理店募集', seoDescription: '美容機器・脱毛機商材の代理店募集一覧です。' },
  { slug: 'beauty-product-marketing', axis: 'product', industry: 'beauty', label: '集客・SNSマーケティング', parentSlug: null, order: 230, seoTitle: '美容向け集客・SNSの代理店募集', seoDescription: '美容サロン向け集客・SNSマーケティング商材の代理店募集一覧です。' },
  { slug: 'beauty-product-supplies',  axis: 'product', industry: 'beauty', label: 'サロン用品・消耗品', parentSlug: null, order: 240, seoTitle: 'サロン用品・消耗品の代理店募集', seoDescription: 'サロン用品・消耗品の代理店募集一覧です。' },
  { slug: 'beauty-product-other',     axis: 'product', industry: 'beauty', label: 'その他美容向け商材', parentSlug: null, order: 250, seoTitle: 'その他美容商材の代理店募集', seoDescription: 'その他美容向け商材の代理店募集一覧です。' },

  // ───── 【IT・AI・DX特化】 ─────
  { slug: 'it-startup',    axis: 'target', industry: 'it', label: 'スタートアップ・ベンチャー', parentSlug: null, order: 310, seoTitle: 'スタートアップ向けIT代理店募集', seoDescription: 'スタートアップ向けIT商材の代理店募集一覧です。' },
  { slug: 'it-smb',        axis: 'target', industry: 'it', label: '中小企業・店舗',             parentSlug: null, order: 320, seoTitle: '中小企業向けIT代理店募集', seoDescription: '中小企業向けIT商材の代理店募集一覧です。' },
  { slug: 'it-enterprise', axis: 'target', industry: 'it', label: '中堅・大企業',               parentSlug: null, order: 330, seoTitle: '中堅・大企業向けIT代理店募集', seoDescription: '中堅・大企業向けIT商材の代理店募集一覧です。' },
  { slug: 'it-freelance',  axis: 'target', industry: 'it', label: 'フリーランス・個人事業主',   parentSlug: null, order: 340, seoTitle: 'フリーランス向けIT代理店募集', seoDescription: 'フリーランス向けIT商材の代理店募集一覧です。' },
  { slug: 'it-public',     axis: 'target', industry: 'it', label: '官公庁・自治体',             parentSlug: null, order: 350, seoTitle: '官公庁向けIT代理店募集', seoDescription: '官公庁・自治体向けIT商材の代理店募集一覧です。' },
  { slug: 'it-other',      axis: 'target', industry: 'it', label: 'その他法人',                 parentSlug: null, order: 360, seoTitle: 'その他法人向けIT代理店募集', seoDescription: 'その他法人向けIT商材の代理店募集一覧です。' },

  { slug: 'it-product-saas',     axis: 'product', industry: 'it', label: 'SaaS・クラウドツール',   parentSlug: null, order: 310, seoTitle: 'SaaSの代理店募集', seoDescription: 'SaaS・クラウドツールの代理店募集一覧です。' },
  { slug: 'it-product-ai',       axis: 'product', industry: 'it', label: 'AI・生成AIツール',       parentSlug: null, order: 320, seoTitle: 'AI・生成AIの代理店募集', seoDescription: 'AI・生成AIツールの代理店募集一覧です。' },
  { slug: 'it-product-dx',       axis: 'product', industry: 'it', label: 'DX・業務効率化',         parentSlug: null, order: 330, seoTitle: 'DX・業務効率化の代理店募集', seoDescription: 'DX・業務効率化商材の代理店募集一覧です。' },
  { slug: 'it-product-security', axis: 'product', industry: 'it', label: 'セキュリティ・インフラ', parentSlug: null, order: 340, seoTitle: 'セキュリティの代理店募集', seoDescription: 'セキュリティ・インフラ商材の代理店募集一覧です。' },
  { slug: 'it-product-dev',      axis: 'product', industry: 'it', label: 'システム開発・Web制作',  parentSlug: null, order: 350, seoTitle: 'システム開発の代理店募集', seoDescription: 'システム開発・Web制作の代理店募集一覧です。' },
  { slug: 'it-product-other',    axis: 'product', industry: 'it', label: 'その他IT商材',           parentSlug: null, order: 360, seoTitle: 'その他IT商材の代理店募集', seoDescription: 'その他IT商材の代理店募集一覧です。' },

  // ───── 【教室・スクール特化】 ─────
  { slug: 'school-cram',      axis: 'target', industry: 'school', label: '学習塾・進学塾',       parentSlug: null, order: 410, seoTitle: '学習塾の代理店募集', seoDescription: '学習塾向けの代理店募集一覧です。' },
  { slug: 'school-language',  axis: 'target', industry: 'school', label: '英会話・語学スクール', parentSlug: null, order: 420, seoTitle: '英会話スクールの代理店募集', seoDescription: '英会話スクール向けの代理店募集一覧です。' },
  { slug: 'school-qualify',   axis: 'target', industry: 'school', label: '資格・スキルスクール', parentSlug: null, order: 430, seoTitle: '資格スクールの代理店募集', seoDescription: '資格スクール向けの代理店募集一覧です。' },
  { slug: 'school-program',   axis: 'target', industry: 'school', label: 'プログラミング・STEM', parentSlug: null, order: 440, seoTitle: 'プログラミングスクールの代理店募集', seoDescription: 'プログラミングスクール向けの代理店募集一覧です。' },
  { slug: 'school-art',       axis: 'target', industry: 'school', label: '音楽・芸術教室',       parentSlug: null, order: 450, seoTitle: '音楽教室の代理店募集', seoDescription: '音楽・芸術教室向けの代理店募集一覧です。' },
  { slug: 'school-other',     axis: 'target', industry: 'school', label: 'その他スクール',       parentSlug: null, order: 460, seoTitle: 'その他スクールの代理店募集', seoDescription: 'その他スクール向けの代理店募集一覧です。' },

  { slug: 'school-product-crm',       axis: 'product', industry: 'school', label: '生徒管理・予約システム', parentSlug: null, order: 410, seoTitle: '生徒管理システムの代理店募集', seoDescription: '生徒管理・予約システムの代理店募集一覧です。' },
  { slug: 'school-product-online',    axis: 'product', industry: 'school', label: 'オンライン授業・配信ツール', parentSlug: null, order: 420, seoTitle: 'オンライン授業ツールの代理店募集', seoDescription: 'オンライン授業・配信ツールの代理店募集一覧です。' },
  { slug: 'school-product-material',  axis: 'product', industry: 'school', label: '教材・コンテンツ',       parentSlug: null, order: 430, seoTitle: '教材の代理店募集', seoDescription: '教材・コンテンツの代理店募集一覧です。' },
  { slug: 'school-product-marketing', axis: 'product', industry: 'school', label: '集客・SNSマーケティング', parentSlug: null, order: 440, seoTitle: 'スクール向け集客の代理店募集', seoDescription: 'スクール向け集客・SNSマーケティングの代理店募集一覧です。' },
  { slug: 'school-product-other',     axis: 'product', industry: 'school', label: 'その他スクール向け商材', parentSlug: null, order: 450, seoTitle: 'その他スクール商材の代理店募集', seoDescription: 'その他スクール向け商材の代理店募集一覧です。' },

  // ───── 【医療・クリニック特化】 ─────
  { slug: 'medical-clinic',    axis: 'target', industry: 'medical', label: 'クリニック・医院',   parentSlug: null, order: 510, seoTitle: 'クリニックの代理店募集', seoDescription: 'クリニック向けの代理店募集一覧です。' },
  { slug: 'medical-dental',    axis: 'target', industry: 'medical', label: '歯科・矯正歯科',     parentSlug: null, order: 520, seoTitle: '歯科の代理店募集', seoDescription: '歯科・矯正歯科向けの代理店募集一覧です。' },
  { slug: 'medical-seitai',    axis: 'target', industry: 'medical', label: '整体・整骨院・鍼灸', parentSlug: null, order: 530, seoTitle: '整体の代理店募集', seoDescription: '整体・整骨院・鍼灸向けの代理店募集一覧です。' },
  { slug: 'medical-pharmacy',  axis: 'target', industry: 'medical', label: '薬局・ドラッグストア', parentSlug: null, order: 540, seoTitle: '薬局の代理店募集', seoDescription: '薬局・ドラッグストア向けの代理店募集一覧です。' },
  { slug: 'medical-nursing',   axis: 'target', industry: 'medical', label: '介護・福祉施設',     parentSlug: null, order: 550, seoTitle: '介護施設の代理店募集', seoDescription: '介護・福祉施設向けの代理店募集一覧です。' },
  { slug: 'medical-other',     axis: 'target', industry: 'medical', label: 'その他医療・福祉',   parentSlug: null, order: 560, seoTitle: 'その他医療の代理店募集', seoDescription: 'その他医療・福祉向けの代理店募集一覧です。' },

  { slug: 'medical-product-ehr',       axis: 'product', industry: 'medical', label: '電子カルテ・レセコン',   parentSlug: null, order: 510, seoTitle: '電子カルテの代理店募集', seoDescription: '電子カルテ・レセコン商材の代理店募集一覧です。' },
  { slug: 'medical-product-reserve',   axis: 'product', industry: 'medical', label: '予約システム・オンライン診療', parentSlug: null, order: 520, seoTitle: '医療予約システムの代理店募集', seoDescription: '予約システム・オンライン診療の代理店募集一覧です。' },
  { slug: 'medical-product-equipment', axis: 'product', industry: 'medical', label: '医療機器・備品',         parentSlug: null, order: 530, seoTitle: '医療機器の代理店募集', seoDescription: '医療機器・備品の代理店募集一覧です。' },
  { slug: 'medical-product-marketing', axis: 'product', industry: 'medical', label: '集客・MEO・Web集患',     parentSlug: null, order: 540, seoTitle: '医療集客の代理店募集', seoDescription: '集客・MEO・Web集患の代理店募集一覧です。' },
  { slug: 'medical-product-other',     axis: 'product', industry: 'medical', label: 'その他医療向け商材',     parentSlug: null, order: 550, seoTitle: 'その他医療商材の代理店募集', seoDescription: 'その他医療向け商材の代理店募集一覧です。' },

  // ───── 【運送・物流特化】 ─────
  { slug: 'logistics-keikamotsu', axis: 'target', industry: 'logistics', label: '軽貨物・宅配代行', parentSlug: null, order: 610, seoTitle: '軽貨物の代理店募集', seoDescription: '軽貨物・宅配代行向けの代理店募集一覧です。' },
  { slug: 'logistics-truck',      axis: 'target', industry: 'logistics', label: 'トラック運送',      parentSlug: null, order: 620, seoTitle: 'トラック運送の代理店募集', seoDescription: 'トラック運送向けの代理店募集一覧です。' },
  { slug: 'logistics-warehouse',  axis: 'target', industry: 'logistics', label: '倉庫・物流センター', parentSlug: null, order: 630, seoTitle: '倉庫の代理店募集', seoDescription: '倉庫・物流センター向けの代理店募集一覧です。' },
  { slug: 'logistics-other',      axis: 'target', industry: 'logistics', label: 'その他物流',        parentSlug: null, order: 640, seoTitle: 'その他物流の代理店募集', seoDescription: 'その他物流向けの代理店募集一覧です。' },

  { slug: 'logistics-product-system',    axis: 'product', industry: 'logistics', label: '配車・運行管理システム', parentSlug: null, order: 610, seoTitle: '配車システムの代理店募集', seoDescription: '配車・運行管理システムの代理店募集一覧です。' },
  { slug: 'logistics-product-equipment', axis: 'product', industry: 'logistics', label: '車両・物流機器',       parentSlug: null, order: 620, seoTitle: '物流機器の代理店募集', seoDescription: '車両・物流機器の代理店募集一覧です。' },
  { slug: 'logistics-product-fuel',      axis: 'product', industry: 'logistics', label: '燃料・メンテナンス',   parentSlug: null, order: 630, seoTitle: '燃料の代理店募集', seoDescription: '燃料・メンテナンスの代理店募集一覧です。' },
  { slug: 'logistics-product-other',     axis: 'product', industry: 'logistics', label: 'その他物流向け商材',   parentSlug: null, order: 640, seoTitle: 'その他物流商材の代理店募集', seoDescription: 'その他物流向け商材の代理店募集一覧です。' },

  // ───── 【建築・不動産特化】 ─────
  { slug: 'realestate-sale',     axis: 'target', industry: 'realestate', label: '不動産売買',       parentSlug: null, order: 610, seoTitle: '不動産売買の代理店募集', seoDescription: '不動産売買向けの代理店募集一覧です。' },
  { slug: 'realestate-rental',   axis: 'target', industry: 'realestate', label: '賃貸管理',         parentSlug: null, order: 620, seoTitle: '賃貸管理の代理店募集', seoDescription: '賃貸管理向けの代理店募集一覧です。' },
  { slug: 'realestate-design',   axis: 'target', industry: 'realestate', label: '建築設計',         parentSlug: null, order: 630, seoTitle: '建築設計の代理店募集', seoDescription: '建築設計向けの代理店募集一覧です。' },
  { slug: 'realestate-construction', axis: 'target', industry: 'realestate', label: '施工・リフォーム', parentSlug: null, order: 640, seoTitle: '施工の代理店募集', seoDescription: '施工・リフォーム向けの代理店募集一覧です。' },
  { slug: 'realestate-other',    axis: 'target', industry: 'realestate', label: 'その他不動産',     parentSlug: null, order: 650, seoTitle: 'その他不動産の代理店募集', seoDescription: 'その他不動産向けの代理店募集一覧です。' },

  { slug: 'realestate-product-system', axis: 'product', industry: 'realestate', label: '物件管理システム',     parentSlug: null, order: 610, seoTitle: '物件管理システムの代理店募集', seoDescription: '物件管理システムの代理店募集一覧です。' },
  { slug: 'realestate-product-cad',    axis: 'product', industry: 'realestate', label: '図面・CADソフト',      parentSlug: null, order: 620, seoTitle: 'CADソフトの代理店募集', seoDescription: '図面・CADソフトの代理店募集一覧です。' },
  { slug: 'realestate-product-material', axis: 'product', industry: 'realestate', label: '建築資材・設備',      parentSlug: null, order: 630, seoTitle: '建築資材の代理店募集', seoDescription: '建築資材・設備の代理店募集一覧です。' },
  { slug: 'realestate-product-marketing', axis: 'product', industry: 'realestate', label: '集客・ポータルサイト', parentSlug: null, order: 640, seoTitle: '不動産集客の代理店募集', seoDescription: '集客・ポータルサイトの代理店募集一覧です。' },
  { slug: 'realestate-product-other',  axis: 'product', industry: 'realestate', label: 'その他不動産向け商材', parentSlug: null, order: 650, seoTitle: 'その他不動産商材の代理店募集', seoDescription: 'その他不動産向け商材の代理店募集一覧です。' },

  // ───── 【オフィス・法人向け特化】 ─────
  { slug: 'office-it',        axis: 'target', industry: 'office', label: 'IT・Web企業',       parentSlug: null, order: 710, seoTitle: 'IT企業向けの代理店募集', seoDescription: 'IT・Web企業向けの代理店募集一覧です。' },
  { slug: 'office-startup',   axis: 'target', industry: 'office', label: 'スタートアップ',   parentSlug: null, order: 720, seoTitle: 'スタートアップ向けの代理店募集', seoDescription: 'スタートアップ向けの代理店募集一覧です。' },
  { slug: 'office-sme',       axis: 'target', industry: 'office', label: '中小企業',         parentSlug: null, order: 730, seoTitle: '中小企業向けの代理店募集', seoDescription: '中小企業向けの代理店募集一覧です。' },
  { slug: 'office-other',     axis: 'target', industry: 'office', label: 'その他法人',       parentSlug: null, order: 740, seoTitle: 'その他法人向けの代理店募集', seoDescription: 'その他法人向けの代理店募集一覧です。' },

  { slug: 'office-product-saas',      axis: 'product', industry: 'office', label: 'バックオフィスSaaS', parentSlug: null, order: 710, seoTitle: 'バックオフィスSaaSの代理店募集', seoDescription: 'バックオフィスSaaSの代理店募集一覧です。' },
  { slug: 'office-product-hr',        axis: 'product', industry: 'office', label: '人材・採用サービス', parentSlug: null, order: 720, seoTitle: '人材サービスの代理店募集', seoDescription: '人材・採用サービスの代理店募集一覧です。' },
  { slug: 'office-product-supplies',  axis: 'product', industry: 'office', label: 'オフィス用品・設備', parentSlug: null, order: 730, seoTitle: 'オフィス用品の代理店募集', seoDescription: 'オフィス用品・設備の代理店募集一覧です。' },
  { slug: 'office-product-other',     axis: 'product', industry: 'office', label: 'その他法人向け商材', parentSlug: null, order: 740, seoTitle: 'その他法人向け商材の代理店募集', seoDescription: 'その他法人向け商材の代理店募集一覧です。' },

  // ───── 【暮らし・インフラ特化】 ─────
  { slug: 'life-housekeeping', axis: 'target', industry: 'life', label: '家事代行・ハウスクリーニング', parentSlug: null, order: 810, seoTitle: '家事代行の代理店募集', seoDescription: '家事代行・ハウスクリーニングの代理店募集一覧です。' },
  { slug: 'life-moving',       axis: 'target', industry: 'life', label: '引越し・運搬',                 parentSlug: null, order: 820, seoTitle: '引越しの代理店募集', seoDescription: '引越し・運搬の代理店募集一覧です。' },
  { slug: 'life-infra',        axis: 'target', industry: 'life', label: '電気・ガス・水道',             parentSlug: null, order: 830, seoTitle: '電気・ガスの代理店募集', seoDescription: '電気・ガス・水道の代理店募集一覧です。' },
  { slug: 'life-reform',       axis: 'target', industry: 'life', label: 'リフォーム・修理',             parentSlug: null, order: 840, seoTitle: 'リフォームの代理店募集', seoDescription: 'リフォーム・修理の代理店募集一覧です。' },
  { slug: 'life-other',        axis: 'target', industry: 'life', label: 'その他生活サービス',           parentSlug: null, order: 850, seoTitle: 'その他生活サービスの代理店募集', seoDescription: 'その他生活サービスの代理店募集一覧です。' },

  { slug: 'life-product-system',    axis: 'product', industry: 'life', label: '予約・顧客管理システム', parentSlug: null, order: 810, seoTitle: '予約システムの代理店募集', seoDescription: '予約・顧客管理システムの代理店募集一覧です。' },
  { slug: 'life-product-supplies',  axis: 'product', industry: 'life', label: '業務用資材・消耗品',     parentSlug: null, order: 820, seoTitle: '業務用資材の代理店募集', seoDescription: '業務用資材・消耗品の代理店募集一覧です。' },
  { slug: 'life-product-marketing', axis: 'product', industry: 'life', label: '集客・地域マーケティング', parentSlug: null, order: 830, seoTitle: '地域マーケティングの代理店募集', seoDescription: '集客・地域マーケティングの代理店募集一覧です。' },
  { slug: 'life-product-other',     axis: 'product', industry: 'life', label: 'その他生活サービス商材', parentSlug: null, order: 840, seoTitle: 'その他生活サービス商材の代理店募集', seoDescription: 'その他生活サービス商材の代理店募集一覧です。' },

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
