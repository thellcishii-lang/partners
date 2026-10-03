import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="space-y-16">
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
    </div>
  );
}
