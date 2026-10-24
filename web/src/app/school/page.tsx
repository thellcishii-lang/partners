import type { Metadata } from 'next';
import Link from 'next/link';
import { ListingsSearch } from '@/components/listings/ListingsSearch';
import { FeaturedHero } from '@/components/listings/FeaturedHero';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: '教室・スクールの代理店・加盟店募集｜スクール専門サイト',
  description: '学習塾、英会話、プログラミング、資格スクールなど、教育ビジネスに特化した代理店・加盟店の募集案件が見つかります。',
  alternates: { canonical: '/school' },
};

const FAQS = [
  { q: '教室・スクールの開業に必要な資格はありますか？', a: '学習塾やプログラミング教室は資格がなくても開業可能です。英会話スクールなども特に必須資格はありませんが、フランチャイズに加盟する場合は本部独自の研修や認定制度がある場合があります。' },
  { q: '集客がうまくいくか不安です。', a: '本部のブランド力があるフランチャイズは、初めから一定の集客が見込めます。また、地域密着型の教室の場合は、チラシ配布や口コミ、MEO対策（Googleマップの最適化）が効果的です。体験授業を積極的に実施して保護者や生徒との接点を増やしましょう。' },
  { q: 'オンラインスクールも代理店で募集していますか？', a: 'はい。近年はプログラミングや英会話など、完全オンラインで完結するスクールの代理店案件も増えています。場所にとらわれず全国の生徒を対象にできるため、スモールスタートに適しています。' },
];

export default function SchoolHomePage() {
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

      <section className="relative overflow-hidden bg-teal-50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <span className="inline-block rounded-full bg-teal-100 px-4 py-1.5 text-xs font-bold text-teal-700">教室・スクール専門の代理店・加盟店募集</span>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-teal-950 sm:text-5xl">教室・スクールの開業を、<br /><span className="text-teal-600">もっと身近に。</span></h1>
          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-teal-800/80">学習塾、英会話、プログラミングから、生徒管理システムの商材まで。教育ビジネスに特化した募集案件が見つかります。</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/"><Button size="lg" variant="outline" className="w-full border-teal-600 text-teal-700 hover:bg-teal-50 sm:w-auto">全業種の代理店募集はこちら</Button></Link>
            <Link href="/school/listings/new"><Button size="lg" className="w-full bg-teal-600 text-white hover:bg-teal-700 sm:w-auto">スクール向けの案件を掲載する</Button></Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 space-y-6"> 
        <FeaturedHero industry="school" />
        <ListingsSearch industry="school" />
      </div>

      <section className="mx-auto max-w-4xl px-4 py-12">
        <h2 className="mb-6 border-b-2 border-teal-200 pb-2 text-2xl font-bold text-teal-950">教育・スクールビジネスとは？</h2>
        <div className="space-y-4 text-sm leading-relaxed text-gray-700">
          <p>少子化が進む一方で、教育熱心な保護者の増加やリスキリング（学び直し）需要の高まりにより、教育ビジネスは依然として根強い人気があります。</p>
          <p>個人で学習塾や英会話教室を開業する場合、<strong>フランチャイズ（FC）加盟</strong>が最も成功率の高い方法の一つです。カリキュラムや教材、本部のブランド力を使えるため、集客のハードルが下がります。また、生徒管理システムやオンライン配信ツールの代理店として、既存の教育機関に営業をかけるBtoBビジネスも非常に稼ぎやすい分野です。</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-16">
        <h2 className="mb-6 border-b-2 border-teal-200 pb-2 text-2xl font-bold text-teal-950">よくある質問</h2>
        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <div key={index} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="flex items-start gap-2 font-bold text-gray-900"><span className="text-teal-600">Q.</span>{faq.q}</h3>
              <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-gray-600"><span className="font-bold text-teal-600">A.</span>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-teal-50/50 py-12">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-6 text-center text-xl font-bold text-teal-950">教育ビジネスに役立つガイド</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/guide/why-platform-business" className="block rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-xs font-bold text-teal-600">起業</p>
              <p className="mt-1 font-bold text-gray-900">起業するなら、1から始めない方がいい理由</p>
            </Link>
            <Link href="/guide/side-job-agent" className="block rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-xs font-bold text-teal-600">副業</p>
              <p className="mt-1 font-bold text-gray-900">副業で代理店・加盟店を始める完全ガイド</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
