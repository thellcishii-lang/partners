import type { Metadata } from 'next';
import Link from 'next/link';
import { ListingsSearch } from '@/components/listings/ListingsSearch';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'IT・AI・DXツールの代理店募集｜IT専門サイト',
  description: 'SaaS、生成AI、DX支援、システム開発など、ITビジネスに特化した代理店募集案件が見つかります。副業から法人向けまで幅広く検索可能。',
  alternates: { canonical: '/it' },
  openGraph: {
    title: 'IT・AI・DXツールの代理店募集｜IT専門サイト',
    description: 'SaaS、生成AI、DX支援などITビジネスに特化した代理店募集案件を探せます。',
    url: '/it',
  },
};

export default function ItHomePage() {
  return (
    <div className="space-y-8">
      {/* IT専用ヒーロー */}
      <section className="relative overflow-hidden bg-indigo-50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <span className="inline-block rounded-full bg-indigo-100 px-4 py-1.5 text-xs font-bold text-indigo-700">
            IT・AI・DX専門の代理店募集
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-indigo-950 sm:text-5xl">
            ITツールの代理店で、
            <br />
            <span className="text-indigo-600">ストック収益を築く。</span>
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-indigo-800/80">
            SaaS、生成AI、DX支援ツールから、システム開発の受託まで。
            IT・テクノロジーに特化した募集案件が見つかります。
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/">
              <Button size="lg" variant="outline" className="w-full border-indigo-600 text-indigo-700 hover:bg-indigo-50 sm:w-auto">
                全業種の代理店募集はこちら
              </Button>
            </Link>

            <Link href="/it/listings/new">
              <Button size="lg" className="w-full bg-indigo-600 text-white hover:bg-indigo-700 sm:w-auto">
                IT向けの案件を掲載する
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* IT専用の検索・一覧 */}
      <div className="mx-auto max-w-6xl px-4">
        <ListingsSearch industry="it" />
      </div>
    </div>
  );
}
