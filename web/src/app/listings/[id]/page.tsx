import type { Metadata } from 'next';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { ListingPageClient } from './ListingPageClient';

const SITE_URL = 'https://www.代理店・加盟店募集.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const db = getAdminDb();
    const snap = await db.collection('listings').doc(id).get();
    if (!snap.exists) return { title: '案件が見つかりません' };
    const data = snap.data()!;
    const title = (data.title as string) ?? '案件';
    const description = ((data.description as string) ?? '').slice(0, 120);
    
    return {
      title: `${title} | 代理店・加盟店募集.com`,
      description,
      alternates: { canonical: `/listings/${id}` },
      openGraph: {
        title,
        description,
        url: `${SITE_URL}/listings/${id}`,
        images: data.images?.[0] ? [data.images[0]] : undefined,
      },
    };
  } catch {
    return { title: '代理店・加盟店募集.com' };
  }
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // 構造化データ用のデータを取得
  let structuredData: any = null;
  try {
    const db = getAdminDb();
    const snap = await db.collection('listings').doc(id).get();
    if (snap.exists) {
      const data = snap.data()!;
      const title = (data.title as string) ?? '案件';
      const companyName = (data.companyName as string) ?? '募集企業';
      const description = ((data.description as string) ?? '').slice(0, 150);

      structuredData = [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'ホーム',
              item: SITE_URL,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: '案件一覧',
              item: `${SITE_URL}/listings`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: title,
              item: `${SITE_URL}/listings/${id}`,
            },
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: title,
          description: description,
          brand: {
            '@type': 'Organization',
            name: companyName,
          },
          offers: {
            '@type': 'Offer',
            url: `${SITE_URL}/listings/${id}`,
            priceCurrency: 'JPY',
            // 初期費用が0円なら0、不明なら省略
            price: data.initialCostYen === 0 ? 0 : undefined,
            availability: 'https://schema.org/InStock',
          },
        },
      ];
    }
  } catch (error) {
    console.error('Failed to generate structured data', error);
  }

  return (
    <>
      <ListingPageClient />
      
      {/* 構造化データの出力 */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
    </>
  );
}
