import type { Metadata } from 'next';
import Link from 'next/link';
import { ListingsSearch } from '@/components/listings/ListingsSearch';
import { FeaturedHero } from '@/components/listings/FeaturedHero';
import { GuidePromoSection } from '@/components/guide/GuidePromoSection';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section
        className="animate-flow relative left-1/2 w-screen -translate-x-1/2"
        style={{
          backgroundImage:
            'linear-gradient(120deg, #d1fae5 0%, #a7f3d0 25%, #bfdbfe 50%, #c7d2fe 75%, #d1fae5 100%)',
        }}
      >
        <div className="mx-auto max-w-6xl px-4 py-16 text-center text-emerald-900 sm:py-24">
          <h1 className="text-3xl font-bold leading-tight sm:text-5xl">
            独立開業への、最短ルート。
            <br className="hidden sm:block" />
            代理店・加盟店で、成功を掴む。
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-emerald-800 opacity-80 sm:text-base">
            初期費用0円〜、在庫リスクなし、未経験OK。
            <br className="hidden sm:block" />
            あなたに合った代理店・加盟店が、ここで見つかる。
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/listings">
              <Button
                size="lg"
                className="w-full bg-emerald-600 text-white hover:bg-emerald-700 sm:w-auto"
              >
                案件を探す
              </Button>
            </Link>
            <Link href="/for-advertisers">
              <Button
                size="lg"
                variant="outline"
                className="w-full border-emerald-600 bg-white text-emerald-800 hover:bg-emerald-50 sm:w-auto"
              >
                掲載についてはこちら
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* おすすめ案件（上部表示契約のもの） */}
      <FeaturedHero />

      {/* ★追加：飲食店特化サイトへのバナー */}
      <section className="mx-auto max-w-6xl px-4">
        <Link href="/eat" className="block overflow-hidden rounded-2xl bg-orange-500 p-6 shadow-md transition hover:bg-orange-600 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-orange-100">🍽 飲食店専門の代理店・加盟店募集</p>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                飲食店の独立・開業をお考えの方はこちら
              </h2>
              <p className="mt-2 text-sm text-orange-50">
                カフェ、居酒屋、ラーメン店、POSレジ・食材仕入れなどの専門案件が見つかります。
              </p>
            </div>
            <div className="hidden shrink-0 text-2xl text-white sm:block">
              →
            </div>
          </div>
        </Link>
      </section>

      <ListingsSearch />

      <GuidePromoSection />
    </div>
  );
}
