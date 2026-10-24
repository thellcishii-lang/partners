import type { Metadata } from 'next';
import Link from 'next/link';
import { ListingsSearch } from '@/components/listings/ListingsSearch';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'オフィス・法人向けの代理店・加盟店募集｜法人専門サイト',
  description: 'オフィス用品、バックオフィスSaaS、人材サービスなど、法人向けビジネスに特化した代理店・加盟店の募集案件が見つかります。',
  alternates: { canonical: '/office' },
};

const FAQS = [
  { q: '法人向け（BtoB）の営業未経験でもできますか？', a: '可能です。BtoBの代理店は「顧客の課題を解決する提案」ができれば未経験でも成約に繋がります。特にSaaSなどのITツールは、デモンストレーションや導入事例の資料が用意されていることが多く、営業トークのハードルが低いのが特徴です。' },
  { q: 'オフィス用品の代理店は儲かりますか？', a: 'オフィス用品は消耗品が多く、リピート発注が見込めるため「ストック型」の安定収益が期待できます。1件あたりの利益率は高くありませんが、顧客数を積み上げることで大きな売上になります。' },
  { q: '人材紹介の代理店はどのように稼ぐのですか？', a: '企業に人材を紹介し、その人が入社（決定）した際に、企業から紹介手数料（年収の30%前後など）を受け取る仕組みです。1件あたりの単価が非常に高いのが特徴です。' },
];

export default function OfficeHomePage() {
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

      <section className="relative overflow-hidden bg-slate-50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <span className="inline-block rounded-full bg-slate-200 px-4 py-1.5 text-xs font-bold text-slate-700">オフィス・法人向け専門の代理店・加盟店募集</span>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl">法人向けビジネスの開業を、<br /><span className="text-slate-600">もっとスマートに。</span></h1>
          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-slate-800/80">オフィス用品、バックオフィスSaaS、人材紹介から、法人営業のアウトソーシングまで。法人向けビジネスに特化した募集案件が見つかります。</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/"><Button size="lg" variant="outline" className="w-full border-slate-600 text-slate-700 hover:bg-slate-100 sm:w-auto">全業種の代理店募集はこちら</Button></Link>
            <Link href="/office/listings/new"><Button size="lg" className="w-full bg-slate-700 text-white hover:bg-slate-800 sm:w-auto">法人向けの案件を掲載する</Button></Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4"><ListingsSearch industry="office" /></div>

      <section className="mx-auto max-w-4xl px-4 py-12">
        <h2 className="mb-6 border-b-2 border-slate-200 pb-2 text-2xl font-bold text-slate-950">法人向け（BtoB）代理店ビジネス</h2>
        <div className="space-y-4 text-sm leading-relaxed text-gray-700">
          <p>「法人向け」と聞くと、高度な営業スキルが必要なイメージを持つかもしれませんが、実は個人でも参入しやすい分野です。特に、バックオフィス業務の効率化を支援するSaaSや、オフィス用品の販売代理店は、安定した収益基盤を作りやすいのが特徴です。</p>
          <p>また、企業の採用活動を支援する人材紹介の代理店は、1件の成約で数十万円の報酬が得られることもあり、ハイリスク・ハイリターンなビジネスとして人気があります。</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-16">
        <h2 className="mb-6 border-b-2 border-slate-200 pb-2 text-2xl font-bold text-slate-950">よくある質問</h2>
        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <div key={index} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="flex items-start gap-2 font-bold text-gray-900"><span className="text-slate-600">Q.</span>{faq.q}</h3>
              <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-gray-600"><span className="font-bold text-slate-600">A.</span>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50/50 py-12">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-6 text-center text-xl font-bold text-slate-950">法人ビジネスに役立つガイド</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/guide/stock-business-basics" className="block rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-xs font-bold text-slate-600">ビジネスモデル</p>
              <p className="mt-1 font-bold text-gray-900">ストックビジネスとは？サブスク時代に注目される仕組み</p>
            </Link>
            <Link href="/guide/agent-vs-affiliate" className="block rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-xs font-bold text-slate-600">比較</p>
              <p className="mt-1 font-bold text-gray-900">代理店とアフィリエイトの違い｜どちらが稼げるか</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
