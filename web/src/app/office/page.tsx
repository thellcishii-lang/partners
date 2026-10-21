import type { Metadata } from 'next';
import Link from 'next/link';
import { ListingsSearch } from '@/components/listings/ListingsSearch';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'オフィス・法人向けの代理店・加盟店募集｜法人専門サイト',
  description: 'オフィス用品、バックオフィスSaaS、人材サービスなど、法人向けビジネスに特化した代理店・加盟店の募集案件が見つかります。',
  alternates: { canonical: '/office' },
};

export default function OfficeHomePage() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden bg-slate-50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <span className="inline-block rounded-full bg-slate-200 px-4 py-1.5 text-xs font-bold text-slate-700">
            オフィス・法人向け専門の代理店・加盟店募集
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl">
            法人向けビジネスの開業を、
            <br />
            <span className="text-slate-600">もっとスマートに。</span>
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-slate-800/80">
            オフィス用品、バックオフィスSaaS、人材紹介から、法人営業のアウトソーシングまで。
            法人向けビジネスに特化した募集案件が見つかります。
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/">
              <Button size="lg" variant="outline" className="w-full border-slate-600 text-slate-700 hover:bg-slate-100 sm:w-auto">
                全業種の代理店募集はこちら
              </Button>
            </Link>
            <Link href="/office/listings/new">
              <Button size="lg" className="w-full bg-slate-700 text-white hover:bg-slate-800 sm:w-auto">
                法人向けの案件を掲載する
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        <ListingsSearch industry="office" />
      </div>
    </div>
  );
}
