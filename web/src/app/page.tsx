import Link from 'next/link';
import { ListingsSearch } from '@/components/listings/ListingsSearch';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-gradient-to-br from-emerald-200 via-emerald-100 to-teal-100">
        <div className="pointer-events-none absolute inset-0">
          <div
            className="animate-blob absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-emerald-400 opacity-50 blur-3xl"
          />
          <div
            className="animate-blob animation-delay-2000 absolute -right-32 top-1/4 h-[500px] w-[500px] rounded-full bg-teal-400 opacity-50 blur-3xl"
          />
          <div
            className="animate-blob animation-delay-4000 absolute -bottom-32 left-1/3 h-[500px] w-[500px] rounded-full bg-emerald-300 opacity-50 blur-3xl"
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-16 text-center text-emerald-900 sm:py-24">
          <h1 className="text-3xl font-bold leading-tight sm:text-5xl">
            いい代理店と、<br className="sm:hidden" />いい募集案件を、ここで。
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-emerald-800 opacity-80 sm:text-base">
            条件を入れて絞り込む。合わなければ条件を減らして探す。
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
            <Link href="/signup">
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
    </div>
  );
}

      {/* 検索 */}
      <ListingsSearch />
    </div>
  );
}
