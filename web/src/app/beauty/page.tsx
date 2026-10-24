import type { Metadata } from 'next';
import Link from 'next/link';
import { ListingsSearch } from '@/components/listings/ListingsSearch';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: '美容・エステの代理店・加盟店募集｜美容専門サイト',
  description: '美容室、エステ、ネイル、脱毛サロンから、予約システム・美容機器の商材まで。美容ビジネスに特化した代理店・加盟店の募集案件が見つかります。',
  alternates: { canonical: '/beauty' },
};

const FAQS = [
  { q: '美容サロンの独立・開業には何が必要ですか？', a: '美容室は美容師免許、ネイルはネイリスト技能検定など、業態によって必要な資格が異なります。エステや脱毛サロンは資格がなくても開業可能ですが、フランチャイズに加盟すると研修制度が充実しているため安心です。' },
  { q: '初期費用を抑えて始める方法はありますか？', a: '予約システムや集客ツールの販売代理店として副業から始める方法や、面貸し（レンタルサロン）を利用して初期費用を抑えて独立する方法があります。' },
  { q: '集客はどうすればいいですか？', a: 'ホットペッパービューティーなどのポータルサイトへの掲載が最も一般的です。最近ではInstagramやTikTokを使ったSNS集客や、MEO対策（Googleマップの最適化）も重要になっています。' },
];

export default function BeautyHomePage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };

  return (
    <div className="space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <section className="relative overflow-hidden bg-rose-50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <span className="inline-block rounded-full bg-rose-100 px-4 py-1.5 text-xs font-bold text-rose-700">美容・エステ専門の代理店・加盟店募集</span>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-rose-950 sm:text-5xl">美容サロンの独立・開業を、<br /><span className="text-rose-600">もっと美しく。</span></h1>
          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-rose-800/80">美容室、エステ、ネイル、脱毛サロンから、予約システム・美容機器の商材まで。美容ビジネスに特化した募集案件が見つかります。</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/"><Button size="lg" variant="outline" className="w-full border-rose-600 text-rose-700 hover:bg-rose-50 sm:w-auto">全業種の代理店募集はこちら</Button></Link>
            <Link href="/beauty/listings/new"><Button size="lg" className="w-full bg-rose-600 text-white hover:bg-rose-700 sm:w-auto">美容向けの案件を掲載する</Button></Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4"><ListingsSearch industry="beauty" /></div>

      <section className="mx-auto max-w-4xl px-4 py-12">
        <h2 className="mb-6 border-b-2 border-rose-200 pb-2 text-2xl font-bold text-rose-950">美容サロンの独立・開業とは？</h2>
        <div className="space-y-4 text-sm leading-relaxed text-gray-700">
          <p>美容業界は、独立開業を目指す方に最も人気のある分野の一つです。しかし、ゼロから店舗を構えて集客するのは容易ではありません。そこで活用したいのが、既存の<strong>フランチャイズ（FC）への加盟</strong>や、<strong>美容商材の代理店</strong>としてのビジネスです。</p>
          <p>FC加盟なら本部のブランド力と集客ノウハウを借りられるため、未経験でも安定した経営が期待できます。一方、予約システムや美容機器の代理店は、在庫を持たずに自分のペースで働けるため、副業やスモールスタートに最適です。</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-16">
        <h2 className="mb-6 border-b-2 border-rose-200 pb-2 text-2xl font-bold text-rose-950">よくある質問</h2>
        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <div key={index} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="flex items-start gap-2 font-bold text-gray-900"><span className="text-rose-600">Q.</span>{faq.q}</h3>
              <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-gray-600"><span className="font-bold text-rose-600">A.</span>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-rose-50/50 py-12">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-6 text-center text-xl font-bold text-rose-950">美容・独立に役立つガイド</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/guide/beauty-franchise" className="block rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-xs font-bold text-rose-600">美容FC</p>
              <p className="mt-1 font-bold text-gray-900">美容・エステ・脱毛サロンの加盟店の選び方</p>
            </Link>
            <Link href="/guide/why-platform-business" className="block rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-xs font-bold text-rose-600">起業</p>
              <p className="mt-1 font-bold text-gray-900">起業するなら、1から始めない方がいい理由</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
