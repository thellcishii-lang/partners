import type { Metadata } from 'next';
import Link from 'next/link';
import { ListingsSearch } from '@/components/listings/ListingsSearch';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: '暮らしのサービス・インフラの代理店・加盟店募集｜生活密着専門サイト',
  description: '家事代行、引越し、電気・ガス、リフォームなど、暮らしのサービス・インフラビジネスに特化した代理店・加盟店の募集案件が見つかります。',
  alternates: { canonical: '/life' },
};

export default function LifeHomePage() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden bg-green-50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <span className="inline-block rounded-full bg-green-100 px-4 py-1.5 text-xs font-bold text-green-700">
            暮らしのサービス・インフラ専門の代理店募集
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-green-950 sm:text-5xl">
            暮らしを支えるビジネスを、
            <br />
            <span className="text-green-600">もっと身近に。</span>
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-green-800/80">
            家事代行、引越し、電気・ガス、リフォームから、生活インフラの代理店まで。
            暮らしに密着した募集案件が見つかります。
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/">
              <Button size="lg" variant="outline" className="w-full border-green-600 text-green-700 hover:bg-green-50 sm:w-auto">
                全業種の代理店募集はこちら
              </Button>
            </Link>
            <Link href="/life/listings/new">
              <Button size="lg" className="w-full bg-green-600 text-white hover:bg-green-700 sm:w-auto">
                暮らし向けの案件を掲載する
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        <ListingsSearch industry="life" />
      </div>
    </div>
  );
}
