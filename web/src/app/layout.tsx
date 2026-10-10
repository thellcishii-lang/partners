import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { AuthProvider } from '@/providers/AuthProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const SITE_URL = 'https://partners-tau-kohl.vercel.app';
const SITE_NAME = '代理店・加盟店募集.com';
const SITE_DESCRIPTION = '代理店・加盟店・FC加盟の募集と応募ができるマッチングサイト';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
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
