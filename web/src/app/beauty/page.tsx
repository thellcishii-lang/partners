import type { Metadata } from 'next';
import Link from 'next/link';
import { ListingsSearch } from '@/components/listings/ListingsSearch';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: '美容・エステの代理店・加盟店募集｜美容専門サイト',
  description: '美容室、エステ、ネイル、脱毛サロンから、予約システム・美容機器の商材まで。美容ビジネスに特化した代理店・加盟店の募集案件が見つかります。',
  alternates: { canonical: '/beauty' },
  openGraph: {
    title: '美容・エステの代理店・加盟店募集｜美容専門サイト',
    description: '美容室、エステ、ネイルなど美容ビジネスに特化した代理店・加盟店の募集案件を探せます。',
    url: '/beauty',
  },
};

export default function BeautyHomePage() {
  return (
    <div className="space-y-8">
      {/* 美容専用ヒーロー */}
      <section className="relative overflow-hidden bg-rose-50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <span className="inline-block rounded-full bg-rose-100 px-4 py-1.5 text-xs font-bold text-rose-700">
            美容・エステ専門の代理店・加盟店募集
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-rose-950 sm:text-5xl">
            美容サロンの独立・開業を、
            <br />
            <span className="text-rose-600">もっと美しく。</span>
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-rose-800/80">
            美容室、エステ、ネイル、脱毛サロンから、予約システム・美容機器の商材まで。
            美容ビジネスに特化した募集案件が見つかります。
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {/* メインサイトへの相互リンク */}
            <Link href="/">
              <Button size="lg" variant="outline" className="w-full border-rose-600 text-rose-700 hover:bg-rose-50 sm:w-auto">
                全業種の代理店募集はこちら
              </Button>
            </Link>

            {/* 美容向けの案件を作成するボタン */}
            <Link href="/beauty/listings/new">
              <Button size="lg" className="w-full bg-rose-600 text-white hover:bg-rose-700 sm:w-auto">
                美容向けの案件を掲載する
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 美容専用の検索・一覧 */}
      <div className="mx-auto max-w-6xl px-4">
        <ListingsSearch industry="beauty" />
      </div>
    </div>
  );
}
