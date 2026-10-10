import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { AuthProvider } from '@/providers/AuthProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const SITE_URL = 'https://www.代理店・加盟店募集.com';
const SITE_NAME = '代理店・加盟店募集.com';
const SITE_DESCRIPTION =
  '代理店・加盟店・FCで成功の近道を手に入れる。独立開業を目指す方のための募集案件マッチングサイト。様々な業種、全国の地域別に検索可能。';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: '代理店・加盟店募集.com｜独立開業への最短ルートを探す',
    template: '%s｜代理店・加盟店募集.com',
  },
  description: SITE_DESCRIPTION,
  keywords: [
    '代理店募集',
    '加盟店募集',
    'フランチャイズ',
    'FC加盟',
    '独立開業',
    '代理店 副業',
    '業務委託',
    '代理店 マッチング',
    '加盟店 オーナー募集',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: '代理店・加盟店募集.com｜独立開業への最短ルートを探す',
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: SITE_NAME,
              url: SITE_URL,
              potentialAction: {
                '@type': 'SearchAction',
                target: `${SITE_URL}/listings?q={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-6VJ7KTFFR1"
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-6VJ7KTFFR1');
          `}
        </Script>
        <AuthProvider>
          <Header />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
