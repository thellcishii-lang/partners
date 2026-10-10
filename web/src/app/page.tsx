import Link from 'next/link';
import { ListingsSearch } from '@/components/listings/ListingsSearch';
import { GuidePromoSection } from '@/components/guide/GuidePromoSection';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section
        className="animate-flow relative left-1/2 w-screen -translate-x-1/2"
        style={{
          backgroundImage:
            'linear-gradient(120deg, #a7f3d0 0%, #6ee7b7 20%, #93c5fd 45%, #a5b4fc 70%, #6ee7b7 90%, #a7f3d0 100%)'
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

      <ListingsSearch />

      <GuidePromoSection />
    </div>
  );
}
