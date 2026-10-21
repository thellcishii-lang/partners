import type { Metadata } from 'next';
import Link from 'next/link';
import { ListingsSearch } from '@/components/listings/ListingsSearch';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: '建築・不動産の代理店・加盟店募集｜不動産専門サイト',
  description: '不動産売買、賃貸管理、リフォーム、建築設計など、建築・不動産ビジネスに特化した代理店・加盟店の募集案件が見つかります。',
  alternates: { canonical: '/realestate' },
};

export default function RealestateHomePage() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden bg-stone-50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <span className="inline-block rounded-full bg-stone-200 px-4 py-1.5 text-xs font-bold text-stone-700">
            建築・不動産専門の代理店・加盟店募集
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-stone-950 sm:text-5xl">
            建築・不動産の開業を、
            <br />
            <span className="text-stone-600">もっと堅実に。</span>
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-stone-800/80">
            不動産売買、賃貸管理、リフォームから、建築設計・施工の商材まで。
            建築・不動産ビジネスに特化した募集案件が見つかります。
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/">
              <Button size="lg" variant="outline" className="w-full border-stone-600 text-stone-700 hover:bg-stone-100 sm:w-auto">
                全業種の代理店募集はこちら
              </Button>
            </Link>
            <Link href="/realestate/listings/new">
              <Button size="lg" className="w-full bg-stone-700 text-white hover:bg-stone-800 sm:w-auto">
                建築・不動産向けの案件を掲載する
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        <ListingsSearch industry="realestate" />
      </div>
    </div>
  );
}
