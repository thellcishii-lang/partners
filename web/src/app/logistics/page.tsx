import type { Metadata } from 'next';
import Link from 'next/link';
import { ListingsSearch } from '@/components/listings/ListingsSearch';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: '運送・物流の代理店・加盟店募集｜物流専門サイト',
  description: '軽貨物、宅配代行、トラック運送、倉庫管理など、運送・物流ビジネスに特化した代理店・加盟店の募集案件が見つかります。',
  alternates: { canonical: '/logistics' },
};

const FAQS = [
  { q: '軽貨物の代理店・運送業を始めるには何が必要ですか？', a: '軽貨物運送業を始めるには、軽自動車の「黒ナンバー」取得と、国土交通省への「貨物軽自動車運送事業」の届出が必要です。 FC（フランチャイズ）に加盟すると、これらの手続きサポートや安定した荷物の確保が期待できます。' },
  { q: 'トラックの運転手がいなくても代理店はできますか？', a: 'はい。自分で運転せずに、荷主（依頼主）と運送会社をマッチングさせる「配車代行」や、運送会社向けに配車・運行管理システムを販売する「商材系代理店」としてのビジネスがあります。' },
  { q: '物流業界の2024年問題とは何ですか？', a: 'トラックドライバーの時間外労働に上限規制が適用されることで、輸送能力が不足する問題です。この課題を解決するDXツールや、効率的な共同配送の仕組みを提供する代理店ビジネスの需要が高まっています。' },
];

export default function LogisticsHomePage() {
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

      <section className="relative overflow-hidden bg-amber-50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <span className="inline-block rounded-full bg-amber-100 px-4 py-1.5 text-xs font-bold text-amber-700">運送・物流専門の代理店・加盟店募集</span>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-amber-950 sm:text-5xl">運送・物流の開業を、<br /><span className="text-amber-600">もっとスムーズに。</span></h1>
          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-amber-800/80">軽貨物、宅配代行、トラック運送から、配車システム・運行管理の商材まで。物流ビジネスに特化した募集案件が見つかります。</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/"><Button size="lg" variant="outline" className="w-full border-amber-600 text-amber-700 hover:bg-amber-50 sm:w-auto">全業種の代理店募集はこちら</Button></Link>
            <Link href="/logistics/listings/new"><Button size="lg" className="w-full bg-amber-600 text-white hover:bg-amber-700 sm:w-auto">物流向けの案件を掲載する</Button></Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4"><ListingsSearch industry="logistics" /></div>

      <section className="mx-auto max-w-4xl px-4 py-12">
        <h2 className="mb-6 border-b-2 border-amber-200 pb-2 text-2xl font-bold text-amber-950">物流・運送ビジネスの今</h2>
        <div className="space-y-4 text-sm leading-relaxed text-gray-700">
          <p>ECサイトの普及により、私たちの生活に欠かせない「物流」。しかし現在、トラックドライバーの高齢化や人手不足、いわゆる「2024年問題」により、物流業界は大きな転換期を迎えています。</p>
          <p>このような背景から、個人が軽貨物（黒ナンバー）を取得して宅配代行を行うビジネスや、ITの力で物流を効率化する<strong>「配車システム」「運行管理システム」の代理店</strong>の需要が急増しています。ドライバー不足を解消するソリューションを提供する代理店は、今後も安定した収益が見込めるでしょう。</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-16">
        <h2 className="mb-6 border-b-2 border-amber-200 pb-2 text-2xl font-bold text-amber-950">よくある質問</h2>
        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <div key={index} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="flex items-start gap-2 font-bold text-gray-900"><span className="text-amber-600">Q.</span>{faq.q}</h3>
              <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-gray-600"><span className="font-bold text-amber-600">A.</span>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-amber-50/50 py-12">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-6 text-center text-xl font-bold text-amber-950">物流・運送に役立つガイド</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/guide/work-from-home-agent" className="block rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-xs font-bold text-amber-600">働き方</p>
              <p className="mt-1 font-bold text-gray-900">在宅でできる代理店・加盟店｜完全在宅で稼ぐ方法</p>
            </Link>
            <Link href="/guide/side-job-agent" className="block rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-xs font-bold text-amber-600">副業</p>
              <p className="mt-1 font-bold text-gray-900">副業で代理店・加盟店を始める完全ガイド</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
