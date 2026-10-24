import type { Metadata } from 'next';
import Link from 'next/link';
import { ListingsSearch } from '@/components/listings/ListingsSearch';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: '飲食店の代理店・加盟店募集｜飲食店専門サイト',
  description: 'カフェ、居酒屋、ラーメン店から、POSレジ・食材仕入れの商材まで。飲食店ビジネスに特化した代理店・加盟店の募集案件が見つかります。未経験からの開業ノウハウも解説。',
  alternates: { canonical: '/eat' },
};

const FAQS = [
  {
    q: '飲食店の代理店・加盟店とは何ですか？',
    a: '飲食店の代理店は、本部の商材やサービスを店舗に販売・紹介するビジネスです。加盟店は、本部のブランドやノウハウを借りて実際に飲食店を運営するビジネスを指します。',
  },
  {
    q: '初期費用はどのくらいかかりますか？',
    a: '代理店の場合は初期費用0円〜数十万円で始められる案件が多いです。加盟店の場合は、店舗設備や保証金などで数百万円〜数千万円かかるのが一般的です。',
  },
  {
    q: '未経験や副業でも始められますか？',
    a: 'はい。飲食店向けのPOSレジや予約システムの販売代理店などは、在庫を持たずにスキマ時間で始められるため、未経験の副業層にも人気です。',
  },
];

export default function EatHomePage() {
  // FAQの構造化データ
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  return (
    <div className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ヒーローセクション */}
      <section className="relative overflow-hidden bg-orange-50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <span className="inline-block rounded-full bg-orange-100 px-4 py-1.5 text-xs font-bold text-orange-700">
            飲食店専門の代理店・加盟店募集
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-orange-950 sm:text-5xl">
            飲食店の独立・開業を、
            <br />
            <span className="text-orange-600">もっと確実に。</span>
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-orange-800/80">
            カフェ、居酒屋、ラーメン店から、POSレジ・食材仕入れの商材まで。
            飲食店ビジネスに特化した募集案件が見つかります。
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/">
              <Button size="lg" variant="outline" className="w-full border-orange-600 text-orange-700 hover:bg-orange-50 sm:w-auto">
                全業種の代理店募集はこちら
              </Button>
            </Link>
            <Link href="/eat/listings/new">
              <Button size="lg" className="w-full bg-orange-600 text-white hover:bg-orange-700 sm:w-auto">
                飲食店向けの案件を掲載する
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 検索・一覧 */}
      <div className="mx-auto max-w-6xl px-4">
        <ListingsSearch industry="eat" />
      </div>

      {/* ★追加：SEOコンテンツ（解説） */}
      <section className="mx-auto max-w-4xl px-4 py-12">
        <h2 className="mb-6 border-b-2 border-orange-200 pb-2 text-2xl font-bold text-orange-950">
          飲食店の代理店・加盟店募集とは？
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-gray-700">
          <p>
            飲食店ビジネスにおける「代理店」と「加盟店」には、大きく分けて2つの関わり方があります。
            一つは、POSレジや予約システム、食材の仕入れルートなどを飲食店に販売・紹介する「<strong>商材系代理店</strong>」。
            もう一つは、既存の飲食チェーンに加盟し、ブランドやノウハウを借りて実際に店舗を運営する「<strong>フランチャイズ（FC）加盟店</strong>」です。
          </p>
          <p>
            商材系の代理店は、在庫リスクがなく初期費用を抑えて副業から始められるというメリットがあります。一方で、FC加盟店は、本部の強力なブランド力と集客ノウハウを活用できるため、未経験からでも飲食店経営を安定させやすいという特徴があります。
          </p>
          <p>
            当サイトでは、カフェや居酒屋、ラーメン店などの業態別、あるいは集客・デリバリーなどの商材別に、あなたに合った飲食店ビジネスの案件を検索することができます。
          </p>
        </div>
      </section>

      {/* ★追加：よくある質問（FAQ） */}
      <section className="mx-auto max-w-4xl px-4 pb-16">
        <h2 className="mb-6 border-b-2 border-orange-200 pb-2 text-2xl font-bold text-orange-950">
          よくある質問
        </h2>
        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <div key={index} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="flex items-start gap-2 font-bold text-gray-900">
                <span className="text-orange-600">Q.</span>
                {faq.q}
              </h3>
              <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-gray-600">
                <span className="font-bold text-orange-600">A.</span>
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ★追加：関連するガイド記事へのリンク */}
      <section className="bg-orange-50/50 py-12">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-6 text-center text-xl font-bold text-orange-950">
            飲食店の開業に役立つガイド
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/guide/food-franchise" className="block rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-xs font-bold text-orange-600">飲食FC</p>
              <p className="mt-1 font-bold text-gray-900">飲食フランチャイズ加盟のリアル｜失敗しないチェックポイント</p>
            </Link>
            <Link href="/guide/why-platform-business" className="block rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-xs font-bold text-orange-600">起業</p>
              <p className="mt-1 font-bold text-gray-900">起業するなら、1から始めない方がいい理由</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
