import type { Metadata } from 'next';
import Link from 'next/link';
import { ListingsSearch } from '@/components/listings/ListingsSearch';
import { FeaturedHero } from '@/components/listings/FeaturedHero';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'IT・AI・DXツールの代理店募集｜IT専門サイト',
  description: 'SaaS、生成AI、DX支援、システム開発など、ITビジネスに特化した代理店募集案件が見つかります。副業から法人向けまで幅広く検索可能。',
  alternates: { canonical: '/it' },
};

const FAQS = [
  { q: 'ITやSaaSの代理店は未経験でも稼げますか？', a: '可能です。IT商材は目に見える形の商品ではないため、顧客の課題をヒアリングして最適なツールを提案する「コンサル型」の営業が求められます。本部の研修やサポートが手厚い案件を選べば、未経験からでも十分に稼ぐことができます。' },
  { q: 'ストック収益とは何ですか？', a: '代理店が紹介した顧客がサービスを使い続ける限り、毎月継続的に報酬が発生する仕組みです。SaaSの代理店はこのストック収益型が多く、契約が積み上がるほど安定した収入になります。' },
  { q: '法人向けの営業経験がなくても大丈夫ですか？', a: '直販の営業経験がなくても、既存の顧客基盤（例えば自分の勤めている会社や取引先）にツールを紹介するだけでも成約に繋がります。提案資料やデモ環境を用意してくれる本部が多いため、営業スキルよりも「顧客との信頼関係」が重要です。' },
];

export default function ItHomePage() {
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

      <section className="relative overflow-hidden bg-indigo-50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <span className="inline-block rounded-full bg-indigo-100 px-4 py-1.5 text-xs font-bold text-indigo-700">IT・AI・DX専門の代理店募集</span>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-indigo-950 sm:text-5xl">ITツールの代理店で、<br /><span className="text-indigo-600">ストック収益を築く。</span></h1>
          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-indigo-800/80">SaaS、生成AI、DX支援ツールから、システム開発の受託まで。IT・テクノロジーに特化した募集案件が見つかります。</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/"><Button size="lg" variant="outline" className="w-full border-indigo-600 text-indigo-700 hover:bg-indigo-50 sm:w-auto">全業種の代理店募集はこちら</Button></Link>
            <Link href="/it/listings/new"><Button size="lg" className="w-full bg-indigo-600 text-white hover:bg-indigo-700 sm:w-auto">IT向けの案件を掲載する</Button></Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 space-y-6"> 
        <FeaturedHero industry="it" />
        <ListingsSearch industry="it" />
      </div>

      <section className="mx-auto max-w-4xl px-4 py-12">
        <h2 className="mb-6 border-b-2 border-indigo-200 pb-2 text-2xl font-bold text-indigo-950">IT・AI代理店ビジネスの魅力</h2>
        <div className="space-y-4 text-sm leading-relaxed text-gray-700">
          <p>IT・AI業界は、今もっとも市場が拡大している分野です。企業のDX推進やAI導入が進む中で、これらのツールを企業に販売・導入する代理店の需要が高まっています。</p>
          <p>最大の魅力は、<strong>「ストック型の収益モデル」</strong>であることです。一度契約が取れれば、解約されない限り毎月報酬が積み上がるため、長期的に安定したビジネスを築くことができます。また、在庫を持たずにオンラインで完結する案件も多く、副業やフリーランスの方にも最適です。</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-16">
        <h2 className="mb-6 border-b-2 border-indigo-200 pb-2 text-2xl font-bold text-indigo-950">よくある質問</h2>
        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <div key={index} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="flex items-start gap-2 font-bold text-gray-900"><span className="text-indigo-600">Q.</span>{faq.q}</h3>
              <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-gray-600"><span className="font-bold text-indigo-600">A.</span>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-indigo-50/50 py-12">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-6 text-center text-xl font-bold text-indigo-950">IT・AI代理店に役立つガイド</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/guide/ai-saas-agent" className="block rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-xs font-bold text-indigo-600">AI・SaaS</p>
              <p className="mt-1 font-bold text-gray-900">AI・SaaS代理店の始め方｜未経験からストック収益を作る</p>
            </Link>
            <Link href="/guide/stock-business-basics" className="block rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-xs font-bold text-indigo-600">ビジネスモデル</p>
              <p className="mt-1 font-bold text-gray-900">ストックビジネスとは？サブスク時代に注目される仕組み</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
