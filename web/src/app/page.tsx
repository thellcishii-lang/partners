import Link from 'next/link';
import { ListingsSearch } from '@/components/listings/ListingsSearch';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* 全幅ヒーロー */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 bg-gradient-to-br from-emerald-600 to-emerald-700">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center text-white sm:py-20">
          <h1 className="text-3xl font-bold leading-tight sm:text-5xl">
            いい代理店と、<br className="sm:hidden" />いい募集案件を、ここで。
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm opacity-90 sm:text-base">
            条件を入れて絞り込む。合わなければ条件を減らして探す。
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/listings">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                案件を探す
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                size="lg"
                variant="ghost"
                className="w-full text-white hover:bg-white/10 sm:w-auto"
              >
                掲載についてはこちら
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 検索 */}
      <ListingsSearch />
    </div>
  );
}

      {/* 検索 */}
      <ListingsSearch />
    </div>
  );
}
