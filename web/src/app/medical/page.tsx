import type { Metadata } from 'next';
import Link from 'next/link';
import { ListingsSearch } from '@/components/listings/ListingsSearch';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: '医療・クリニック・整体の代理店・加盟店募集｜医療専門サイト',
  description: 'クリニック、歯科、整体、薬局、介護施設など、医療・ヘルスケアビジネスに特化した代理店・加盟店の募集案件が見つかります。',
  alternates: { canonical: '/medical' },
};

export default function MedicalHomePage() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden bg-blue-50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <span className="inline-block rounded-full bg-blue-100 px-4 py-1.5 text-xs font-bold text-blue-700">
            医療・クリニック専門の代理店・加盟店募集
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-blue-950 sm:text-5xl">
            医療・クリニックの開業を、
            <br />
            <span className="text-blue-600">もっと確実に。</span>
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-blue-800/80">
            クリニック、歯科、整体、薬局から、電子カルテ・予約システムの商材まで。
            医療・ヘルスケアビジネスに特化した募集案件が見つかります。
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/">
              <Button size="lg" variant="outline" className="w-full border-blue-600 text-blue-700 hover:bg-blue-50 sm:w-auto">
                全業種の代理店募集はこちら
              </Button>
            </Link>
            <Link href="/medical/listings/new">
              <Button size="lg" className="w-full bg-blue-600 text-white hover:bg-blue-700 sm:w-auto">
                医療向けの案件を掲載する
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        <ListingsSearch industry="medical" />
      </div>
    </div>
  );
}
