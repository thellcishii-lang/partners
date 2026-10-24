import type { Metadata } from 'next';
import Link from 'next/link';
import { ListingsSearch } from '@/components/listings/ListingsSearch';
import { FeaturedHero } from '@/components/listings/FeaturedHero';

import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: '建築・不動産の代理店・加盟店募集｜不動産専門サイト',
  description: '不動産売買、賃貸管理、リフォーム、建築設計など、建築・不動産ビジネスに特化した代理店・加盟店の募集案件が見つかります。',
  alternates: { canonical: '/realestate' },
};

const FAQS = [
  { q: '不動産の代理店・加盟店を始めるには資格が必要ですか？', a: '不動産の「売買」や「賃貸の媒介」を行うには「宅地建物取引士（宅建士）」の資格が必要です。ただし、リフォーム会社や建築設計事務所、不動産会社向けのITツール（物件管理システム等）の販売代理店は資格がなくても始められます。' },
  { q: '建築・不動産のフランチャイズのメリットは？', a: '不動産は「信用」が最も重要なビジネスです。フランチャイズに加盟することで本部のブランド力を借りられ、顧客からの信頼を得やすくなります。また、物件情報の共有や、契約書類のサポートなどの面でも大きなメリットがあります。' },
  { q: 'リフォーム営業の代理店は儲かりますか？', a: 'リフォームは1件あたりの単価が高く、成約報酬も高額になる傾向があります。ただし、顧客の課題をヒアリングして最適な提案をするスキルが求められます。未経験の場合は、研修制度が充実した本部を選ぶことが成功のカギです。' },
];

export default function RealestateHomePage() {
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

      <section className="relative overflow-hidden bg-stone-50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <span className="inline-block rounded-full bg-stone-200 px-4 py-1.5 text-xs font-bold text-stone-700">建築・不動産専門の代理店・加盟店募集</span>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-stone-950 sm:text-5xl">建築・不動産の開業を、<br /><span className="text-stone-600">もっと堅実に。</span></h1>
          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-stone-800/80">不動産売買、賃貸管理、リフォームから、建築設計・施工の商材まで。建築・不動産ビジネスに特化した募集案件が見つかります。</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/"><Button size="lg" variant="outline" className="w-full border-stone-600 text-stone-700 hover:bg-stone-100 sm:w-auto">全業種の代理店募集はこちら</Button></Link>
            <Link href="/realestate/listings/new"><Button size="lg" className="w-full bg-stone-700 text-white hover:bg-stone-800 sm:w-auto">建築・不動産向けの案件を掲載する</Button></Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 space-y-6"> 
        <FeaturedHero industry="realestate" />
        <ListingsSearch industry="realestate" />
      </div>

      <section className="mx-auto max-w-4xl px-4 py-12">
        <h2 className="mb-6 border-b-2 border-stone-200 pb-2 text-2xl font-bold text-stone-950">建築・不動産業界での独立・開業</h2>
        <div className="space-y-4 text-sm leading-relaxed text-gray-700">
          <p>不動産や建築は、扱う金額が大きく、景気に左右されにくい「堅実なビジネス」として根強い人気があります。個人で不動産仲介を行う場合は「宅建士」の資格が必要ですが、リフォーム代理店や不動産テック（PropTech）の商材代理店であれば、資格なしでも参入可能です。</p>
          <p>また、FC加盟であれば本部のブランドと仕組みを活用して開業できます。街の不動産屋や工務店は、地域密着型のビジネスとして安定した収益を上げ続けています。</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-16">
        <h2 className="mb-6 border-b-2 border-stone-200 pb-2 text-2xl font-bold text-stone-950">よくある質問</h2>
        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <div key={index} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="flex items-start gap-2 font-bold text-gray-900"><span className="text-stone-600">Q.</span>{faq.q}</h3>
              <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-gray-600"><span className="font-bold text-stone-600">A.</span>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-stone-50/50 py-12">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-6 text-center text-xl font-bold text-stone-950">不動産・建築に役立つガイド</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/guide/why-platform-business" className="block rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-xs font-bold text-stone-600">起業</p>
              <p className="mt-1 font-bold text-gray-900">起業するなら、1から始めない方がいい理由</p>
            </Link>
            <Link href="/guide/agent-vs-franchise" className="block rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-xs font-bold text-stone-600">比較</p>
              <p className="mt-1 font-bold text-gray-900">代理店・フランチャイズ・加盟店の違い、徹底解説</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
