import type { Metadata } from 'next';
import Link from 'next/link';
import { ListingsSearch } from '@/components/listings/ListingsSearch';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: '運送・物流の代理店・加盟店募集｜物流専門サイト',
  description: '軽貨物、宅配代行、トラック運送、倉庫管理など、運送・物流ビジネスに特化した代理店・加盟店の募集案件が見つかります。',
  alternates: { canonical: '/logistics' },
};

export default function LogisticsHomePage() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden bg-amber-50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <span className="inline-block rounded-full bg-amber-100 px-4 py-1.5 text-xs font-bold text-amber-700">
            運送・物流専門の代理店・加盟店募集
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-amber-950 sm:text-5xl">
            運送・物流の開業を、
            <br />
            <span className="text-amber-600">もっとスムーズに。</span>
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-amber-800/80">
            軽貨物、宅配代行、トラック運送から、配車システム・運行管理の商材まで。
            物流ビジネスに特化した募集案件が見つかります。
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/">
              <Button size="lg" variant="outline" className="w-full border-amber-600 text-amber-700 hover:bg-amber-50 sm:w-auto">
                全業種の代理店募集はこちら
              </Button>
            </Link>
            <Link href="/logistics/listings/new">
              <Button size="lg" className="w-full bg-amber-600 text-white hover:bg-amber-700 sm:w-auto">
                物流向けの案件を掲載する
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        <ListingsSearch industry="logistics" />
      </div>
    </div>
  );
}
