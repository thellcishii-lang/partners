import type { Metadata } from 'next';
import Link from 'next/link';
import { ListingsSearch } from '@/components/listings/ListingsSearch';
import { FeaturedHero } from '@/components/listings/FeaturedHero';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: '暮らしのサービス・インフラの代理店・加盟店募集｜生活密着専門サイト',
  description: '家事代行、引越し、電気・ガス、リフォームなど、暮らしのサービス・インフラビジネスに特化した代理店・加盟店の募集案件が見つかります。',
  alternates: { canonical: '/life' },
};

const FAQS = [
  { q: '家事代行やハウスクリーニングの開業に資格は必要ですか？', a: '特に国家資格は必要ありません。ただし、清掃のプロとしてのスキルや、顧客のプライバシーを守るための研修を受けることが重要です。フランチャイズに加盟すると、清掃技術の研修や顧客獲得のサポートを受けられます。' },
  { q: '電気・ガスの代理店はどのように稼ぐのですか？', a: '電力・ガス自由化に伴い、顧客を新電力会社に切り替える提案を行い、成約した顧客がサービスを使い続ける限り、毎月の継続報酬（ストック収益）を受け取るビジネスモデルが一般的です。' },
  { q: '地域密着型のサービスは集客が難しいですか？', a: '地域に根ざしたサービスは、チラシ配布や地域の掲示板、口コミが最も効果的です。最近では、MEO対策（Googleマップの最適化）を行い、地域名＋サービス名で検索された時に上位表示させる手法も必須になっています。' },
];

export default function LifeHomePage() {
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

      <section className="relative overflow-hidden bg-lime-50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <span className="inline-block rounded-full bg-lime-100 px-4 py-1.5 text-xs font-bold text-lime-800">暮らしのサービス・インフラ専門の代理店募集</span>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-lime-950 sm:text-5xl">暮らしを支えるビジネスを、<br /><span className="text-lime-700">もっと身近に。</span></h1>
          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-lime-900/80">家事代行、引越し、電気・ガス、リフォームから、生活インフラの代理店まで。暮らしに密着した募集案件が見つかります。</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/"><Button size="lg" variant="outline" className="w-full border-lime-700 text-lime-800 hover:bg-lime-100 sm:w-auto">全業種の代理店募集はこちら</Button></Link>
            <Link href="/life/listings/new"><Button size="lg" className="w-full bg-lime-700 text-white hover:bg-lime-800 sm:w-auto">暮らし向けの案件を掲載する</Button></Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 space-y-6"> 
        <FeaturedHero industry="life" />
        <ListingsSearch industry="life" />
      </div>

      <section className="mx-auto max-w-4xl px-4 py-12">
        <h2 className="mb-6 border-b-2 border-lime-200 pb-2 text-2xl font-bold text-lime-950">暮らしのサービス・インフラビジネス</h2>
        <div className="space-y-4 text-sm leading-relaxed text-gray-700">
          <p>家事代行、引越し、電気・ガスの切り替え、リフォームなど、私たちの日常生活に密着したサービスは、常に安定した需要があります。これらのビジネスは、地域に根ざしているため、一度信頼を得ればリピートや口コミが生まれやすいのが特徴です。</p>
          <p>個人で始める場合は、フランチャイズに加盟してブランド力と集客ノウハウを借りるのが最短ルートです。また、電気・ガスの代理店のように、顧客が契約を継続する限り報酬が入る「ストックビジネス」もあり、堅実に収入を積み上げることができます。</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-16">
        <h2 className="mb-6 border-b-2 border-lime-200 pb-2 text-2xl font-bold text-lime-950">よくある質問</h2>
        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <div key={index} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="flex items-start gap-2 font-bold text-gray-900"><span className="text-lime-700">Q.</span>{faq.q}</h3>
              <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-gray-600"><span className="font-bold text-lime-700">A.</span>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-lime-50/50 py-12">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-6 text-center text-xl font-bold text-lime-950">暮らしのサービスに役立つガイド</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/guide/work-from-home-agent" className="block rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-xs font-bold text-lime-700">働き方</p>
              <p className="mt-1 font-bold text-gray-900">在宅でできる代理店・加盟店｜完全在宅で稼ぐ方法</p>
            </Link>
            <Link href="/guide/referral-agent" className="block rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-xs font-bold text-lime-700">代理店</p>
              <p className="mt-1 font-bold text-gray-900">紹介型代理店で稼ぐ仕組み｜在庫も店舗も不要のビジネス</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
