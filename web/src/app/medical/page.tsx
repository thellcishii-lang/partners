import type { Metadata } from 'next';
import Link from 'next/link';
import { ListingsSearch } from '@/components/listings/ListingsSearch';
import { FeaturedHero } from '@/components/listings/FeaturedHero';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: '医療・クリニック・整体の代理店・加盟店募集｜医療専門サイト',
  description: 'クリニック、歯科、整体、薬局、介護施設など、医療・ヘルスケアビジネスに特化した代理店・加盟店の募集案件が見つかります。',
  alternates: { canonical: '/medical' },
};

const FAQS = [
  { q: '医師免許がなくてもクリニックを開業できますか？', a: '医療行為を行うクリニックは医師免許が必須です。しかし、整体院やリラクゼーションサロン、介護施設などは医師免許がなくても開業可能です。また、電子カルテや予約システムの販売代理店として医療機関と関わる道もあります。' },
  { q: '整体院や整骨院の開業資金はどのくらいですか？', a: '整体院やリラクゼーションサロンであれば、数十万円〜数百万円で開業可能です。整骨院（接骨院）の場合は柔道整復師の資格が必要で、レントゲン等の設備投資が必要になるため、さらに資金が必要になります。' },
  { q: '医療機関の集患（集客）はどうすればいいですか？', a: 'MEO対策（Googleマップの最適化）や、公式LINEを使った予約システムの導入が効果的です。また、ホームページのSEO対策や口コミサイトの管理も重要です。' },
];

export default function MedicalHomePage() {
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

      <section className="relative overflow-hidden bg-blue-50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <span className="inline-block rounded-full bg-blue-100 px-4 py-1.5 text-xs font-bold text-blue-700">医療・クリニック専門の代理店・加盟店募集</span>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-blue-950 sm:text-5xl">医療・クリニックの開業を、<br /><span className="text-blue-600">もっと確実に。</span></h1>
          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-blue-800/80">クリニック、歯科、整体、薬局から、電子カルテ・予約システムの商材まで。医療・ヘルスケアビジネスに特化した募集案件が見つかります。</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/"><Button size="lg" variant="outline" className="w-full border-blue-600 text-blue-700 hover:bg-blue-50 sm:w-auto">全業種の代理店募集はこちら</Button></Link>
            <Link href="/medical/listings/new"><Button size="lg" className="w-full bg-blue-600 text-white hover:bg-blue-700 sm:w-auto">医療向けの案件を掲載する</Button></Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 space-y-6"> 
        <FeaturedHero industry="medical" />
        <ListingsSearch industry="medical" />
      </div>

      <section className="mx-auto max-w-4xl px-4 py-12">
        <h2 className="mb-6 border-b-2 border-blue-200 pb-2 text-2xl font-bold text-blue-950">医療・ヘルスケアビジネスの可能性</h2>
        <div className="space-y-4 text-sm leading-relaxed text-gray-700">
          <p>高齢化社会の進展や健康意識の高まりにより、医療・ヘルスケア業界は常に高い需要があります。クリニックや歯科医院の開業は敷居が高いイメージがありますが、整体院やリラクゼーション施設、あるいは医療機関向けのIT商材（電子カルテ、オンライン診療システム）の代理店など、参入の形は多様です。</p>
          <p>特に近年は、医療現場のDX化が急速に進んでおり、<strong>医療機関向けのITツールを販売する代理店</strong>の需要が急増しています。医療従事者向けの専門知識がなくても、ツールの機能や導入メリットを伝えることで成約に繋がるケースが多くあります。</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-16">
        <h2 className="mb-6 border-b-2 border-blue-200 pb-2 text-2xl font-bold text-blue-950">よくある質問</h2>
        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <div key={index} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="flex items-start gap-2 font-bold text-gray-900"><span className="text-blue-600">Q.</span>{faq.q}</h3>
              <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-gray-600"><span className="font-bold text-blue-600">A.</span>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-blue-50/50 py-12">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-6 text-center text-xl font-bold text-blue-950">医療・起業に役立つガイド</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/guide/why-platform-business" className="block rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-xs font-bold text-blue-600">起業</p>
              <p className="mt-1 font-bold text-gray-900">起業するなら、1から始めない方がいい理由</p>
            </Link>
            <Link href="/guide/pre-startup-checklist" className="block rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-xs font-bold text-blue-600">準備</p>
              <p className="mt-1 font-bold text-gray-900">起業前に、絶対に確認しておくべき5つのこと</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
