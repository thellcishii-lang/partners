import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  TARGET_LABELS,
  PRODUCT_LABELS,
  MODEL_LABELS,
  INITIAL_COST_LABELS,
} from '@/lib/masterLabels';

export default function HomePage() {
  const targets = Object.entries(TARGET_LABELS);
  const productParents = [
    'product-ai-it',
    'product-telecom',
    'product-marketing',
    'product-housing',
    'product-finance',
    'product-beauty',
    'product-food',
    'product-other',
  ];
  const models = Object.entries(MODEL_LABELS);
  const costRanges = Object.entries(INITIAL_COST_LABELS);

  return (
    <div className="space-y-16">
      {/* ============================================================
          ヒーロー
      ============================================================ */}
      <section className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-700 px-6 py-16 text-center text-white sm:px-12 sm:py-24">
        <p className="text-sm font-medium opacity-90">代理店・加盟店・FC加盟のマッチング</p>
        <h1 className="mt-4 text-3xl font-bold sm:text-5xl">
          いい代理店と、<br className="sm:hidden" />いい募集案件を、ここで。
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-sm opacity-90 sm:text-base">
          登録3ヶ月は完全無料。デポジット型で、本当に必要な問い合わせだけにお金を払う。
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/signup">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              募集者として登録（3ヶ月無料）
            </Button>
          </Link>
          <Link href="/listings">
            <Button size="lg" variant="ghost" className="w-full text-white hover:bg-white/10 sm:w-auto">
              案件を探す
            </Button>
          </Link>
        </div>
      </section>

      {/* ============================================================
          特徴
      ============================================================ */}
      <section className="grid gap-6 sm:grid-cols-3">
        {[
          { t: '登録3ヶ月無料', d: '初期費用も月額も0円。まずは掲載だけ始められます。' },
          { t: 'デポジット型', d: '問い合わせ1件につき1デポジット消費。無駄な出費なし。' },
          { t: '保留→自動開示', d: 'デポジット不足時も応募は保留。追加すれば自動で開示。' },
        ].map((f) => (
          <div key={f.t} className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="font-bold">{f.t}</h3>
            <p className="mt-2 text-sm text-gray-600">{f.d}</p>
          </div>
        ))}
      </section>

      {/* ============================================================
          ターゲット別
      ============================================================ */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold">ターゲットから探す</h2>
            <p className="mt-1 text-sm text-gray-600">誰向けの商材かで絞り込む</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {targets.map(([slug, label]) => (
            <Link
              key={slug}
              href={`/listings?target=${slug}`}
              className="rounded-xl bg-white p-4 text-center text-sm font-medium shadow-sm transition hover:ring-2 hover:ring-brand-500"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* ============================================================
          商材別
      ============================================================ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">商材から探す</h2>
          <p className="mt-1 text-sm text-gray-600">扱いたい商材・サービスで絞り込む</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {productParents.map((slug) => (
            <Link
              key={slug}
              href={`/product/${slug}`}
              className="rounded-xl bg-white p-4 text-center text-sm font-medium shadow-sm transition hover:ring-2 hover:ring-brand-500"
            >
              {PRODUCT_LABELS[slug]}
            </Link>
          ))}
        </div>
        <div className="text-right">
          <Link href="/listings" className="text-sm text-brand-700 underline">
            すべての商材を見る
          </Link>
        </div>
      </section>

      {/* ============================================================
          探し方別
      ============================================================ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">探し方から探す</h2>
          <p className="mt-1 text-sm text-gray-600">条件・働き方で絞り込む</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {models.map(([slug, label]) => (
            <Link
              key={slug}
              href={`/listings?model=${slug}`}
              className="rounded-xl bg-white p-4 text-center text-sm font-medium shadow-sm transition hover:ring-2 hover:ring-brand-500"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* ============================================================
          初期費用別
      ============================================================ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">初期費用から探す</h2>
          <p className="mt-1 text-sm text-gray-600">予算に合わせて絞り込む</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {costRanges.map(([slug, label]) => (
            <Link
              key={slug}
              href={`/cost/initial/${slug}`}
              className="rounded-xl bg-white p-4 text-center text-sm font-medium shadow-sm transition hover:ring-2 hover:ring-brand-500"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* ============================================================
          地域別（主要）
      ============================================================ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">地域から探す</h2>
          <p className="mt-1 text-sm text-gray-600">主要エリアの募集案件</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['kanto', '関東'],
            ['kansai', '関西'],
            ['chubu', '中部'],
            ['kyushu', '九州・沖縄'],
            ['tokyo', '東京都'],
            ['osaka', '大阪府'],
            ['aichi', '愛知県'],
            ['fukuoka', '福岡県'],
          ].map(([slug, label]) => (
            <Link
              key={slug}
              href={`/area/${slug}`}
              className="rounded-xl bg-white p-4 text-center text-sm font-medium shadow-sm transition hover:ring-2 hover:ring-brand-500"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* ============================================================
          CTA
      ============================================================ */}
      <section className="rounded-3xl bg-white p-8 text-center shadow-sm sm:p-12">
        <h2 className="text-2xl font-bold">募集企業の方へ</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-600">
          登録3ヶ月は完全無料。デポジット型で、本当に必要な問い合わせだけにお金を払う。
          まずは無料で掲載を始めましょう。
        </p>
        <div className="mt-6">
          <Link href="/signup">
            <Button size="lg">募集者として登録（3ヶ月無料）</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
