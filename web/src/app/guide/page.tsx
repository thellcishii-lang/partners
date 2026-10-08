import type { Metadata } from 'next';
import GuideClient from './GuideClient';
import { GUIDE_ARTICLES } from '@/lib/guideArticles';

const SITE_URL = 'https://partners-tau-kohl.vercel.app';

export const metadata: Metadata = {
  title: '起業・代理店の実践ガイド | 代理店募集・加盟店募集.com',
  description:
    '起業するなら、1から始めるより代理店として乗る方が成功しやすい。費用・リスク・成功確率の違いから、代理店の選び方まで、実践的に解説します。',
  keywords: [
    '起業 代理店',
    '代理店 始め方',
    '加盟店 募集',
    '副業 代理店',
    '代理店 比較',
    'フランチャイズ 代理店 違い',
    'ストックビジネス',
  ],
  alternates: { canonical: '/guide' },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    title: '起業・代理店の実践ガイド | 代理店募集・加盟店募集.com',
    description: '起業するなら代理店。費用・リスク・成功確率の違いから、選び方まで実践的に解説。',
    url: '/guide',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'ホーム', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'ガイド', item: `${SITE_URL}/guide` },
  ],
};

const collectionJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: '起業・代理店の実践ガイド',
  url: `${SITE_URL}/guide`,
  inLanguage: 'ja-JP',
  hasPart: GUIDE_ARTICLES.map((a) => ({
    '@type': 'Article',
    name: a.title,
    description: a.description,
    url: `${SITE_URL}/guide/${a.slug}`,
    datePublished: a.publishedAt,
  })),
};

export default function GuidePage() {
  return (
    <>
      <GuideClient />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
    </>
  );
}
