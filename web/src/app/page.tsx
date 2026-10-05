import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  TARGET_LABELS,
  PRODUCT_LABELS,
  MODEL_LABELS,
  INITIAL_COST_LABELS,
} from '@/lib/masterLabels';

const PRODUCT_PARENTS = [
  'product-ai-it',
  'product-telecom',
  'product-marketing',
  'product-housing',
  'product-finance',
  'product-beauty',
  'product-food',
  'product-other',
];

const MAJOR_AREAS: [string, string][] = [
  ['kanto', '関東'],
  ['kansai', '関西'],
  ['chubu', '中部'],
  ['kyushu', '九州・沖縄'],
  ['tokyo', '東京都'],
  ['osaka', '大阪府'],
  ['aichi', '愛知県'],
  ['fukuoka', '福岡県'],
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* ヒーロー */}
      <section className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-700 px-6 py-12 text-center text-white sm:px-12 sm:py-16">
        <p className="text-sm font-medium opacity-90">
          代理店・加盟店・FC加盟のマッチング
        </p>
        <h1 className="mt-3 text-2xl font-bold sm:text-4xl">
          いい代理店と、いい募集案件を、ここで。
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm opacity-90">
          登録3ヶ月は完全無料。デポジット型で、本当に必要な問い合わせだけにお金を払う。
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
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

      {/* 2カラム */}
      <div className="flex gap-6">
        {/* 左サイドバー */}
        <aside className="hidden w-64 shrink-0 space-y-4 lg:block">
          <SidebarGroup title="ターゲット">
            {Object.entries(TARGET_LABELS).map(([slug, label]) => (
              <SidebarLink key={slug} href={`/listings?target=${slug}`}>
                {label}
              </SidebarLink>
            ))}
          </SidebarGroup>

          <SidebarGroup title="商材">
            {PRODUCT_PARENTS.map((slug) => (
              <SidebarLink key={slug} href={`/product/${slug}`}>
                {PRODUCT_LABELS[slug]}
              </SidebarLink>
            ))}
          </SidebarGroup>

          <SidebarGroup title="探し方">
            {Object.entries(MODEL_LABELS).map(([slug, label]) => (
              <SidebarLink key={slug} href={`/listings?model=${slug}`}>
                {label}
              </SidebarLink>
            ))}
          </SidebarGroup>

          <SidebarGroup title="エリア">
            {MAJOR_AREAS.map(([slug, label]) => (
              <SidebarLink key={slug} href={`/area/${slug}`}>
                {label}
              </SidebarLink>
            ))}
          </SidebarGroup>

          <SidebarGroup title="初期費用">
            {Object.entries(INITIAL_COST_LABELS).map(([slug, label]) => (
              <SidebarLink key={slug} href={`/cost/initial/${slug}`}>
                {label}
              </SidebarLink>
            ))}
          </SidebarGroup>
        </aside>

        {/* 右メイン */}
        <main className="min-w-0 flex-1 space-y-8">
          {/* 検索バー */}
          <section className="rounded-2xl bg-white p-4 shadow-sm">
            <form action="/listings" className="flex gap-2">
              <input
                type="text"
                name="q"
                placeholder="キーワードで探す（例：AI、美容、東京）"
                className="h-11 flex-1 rounded-lg border border-gray-300 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="submit"
                className="h-11 rounded-lg bg-brand-600 px-6 text-sm font-medium text-white hover:bg-brand-700"
              >
                検索
              </button>
            </form>
          </section>

          {/* 選ばれる3つの理由 */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold">選ばれる3つの理由</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { t: '登録3ヶ月無料', d: '初期費用も月額も0円。' },
                { t: 'デポジット型', d: '問い合わせ1件につき1消費。' },
                { t: '保留→自動開示', d: '追加すれば自動で開示。' },
              ].map((f) => (
                <div key={f.t} className="rounded-2xl bg-white p-5 shadow-sm">
                  <h3 className="font-bold">{f.t}</h3>
                  <p className="mt-2 text-sm text-gray-600">{f.d}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 募集者CTA */}
          <section className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold">募集企業の方へ</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-600">
              登録3ヶ月は完全無料。まずは無料で掲載を始めましょう。
            </p>
            <div className="mt-5">
              <Link href="/signup">
                <Button size="lg">募集者として登録（3ヶ月無料）</Button>
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function SidebarGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="mb-2 text-xs font-bold text-gray-700">{title}</p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function SidebarLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block rounded px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-700"
    >
      {children}
    </Link>
  );
}
