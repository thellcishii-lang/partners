import type { Metadata } from 'next';
import Link from 'next/link';
import { ListingsSearch } from '@/components/listings/ListingsSearch';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: '教室・スクールの代理店・加盟店募集｜スクール専門サイト',
  description: '学習塾、英会話、プログラミング、資格スクールなど、教育ビジネスに特化した代理店・加盟店の募集案件が見つかります。',
  alternates: { canonical: '/school' },
};

export default function SchoolHomePage() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden bg-teal-50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <span className="inline-block rounded-full bg-teal-100 px-4 py-1.5 text-xs font-bold text-teal-700">
            教室・スクール専門の代理店・加盟店募集
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-teal-950 sm:text-5xl">
            教室・スクールの開業を、
            <br />
            <span className="text-teal-600">もっと身近に。</span>
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-teal-800/80">
            学習塾、英会話、プログラミングから、生徒管理システムの商材まで。
            教育ビジネスに特化した募集案件が見つかります。
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/">
              <Button size="lg" variant="outline" className="w-full border-teal-600 text-teal-700 hover:bg-teal-50 sm:w-auto">
                全業種の代理店募集はこちら
              </Button>
            </Link>
            <Link href="/school/listings/new">
              <Button size="lg" className="w-full bg-teal-600 text-white hover:bg-teal-700 sm:w-auto">
                スクール向けの案件を掲載する
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        <ListingsSearch industry="school" />
      </div>
    </div>
  );
}
