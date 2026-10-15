import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getServerListing } from '@/lib/serverListings';
import { ListingPageClient } from './ListingPageClient';

const SITE_URL = 'https://www.代理店・加盟店募集.com';

function jsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const listing = await getServerListing(id);
    if (!listing) {
      return {
        title: '案件が見つかりません',
        robots: { index: false, follow: false },
      };
    }

    const title = listing.title || '案件';
    if (listing.status !== 'published') {
      return {
        title,
        robots: { index: false, follow: false },
      };
    }

    const description = (listing.description ?? '').slice(0, 120);
    return {
      title: `${title} | 代理店・加盟店募集.com`,
      description,
      alternates: { canonical: `/listings/${id}` },
      openGraph: {
        title,
        description,
        url: `${SITE_URL}/listings/${id}`,
        images: listing.images?.[0] ? [listing.images[0]] : undefined,
      },
    };
  } catch (error) {
    console.error('generateMetadata: failed to fetch listing', { id, error });
    return {
      title: '代理店・加盟店募集.com',
      robots: { index: false, follow: false },
    };
  }
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getServerListing(id);
  if (!listing) notFound();

  if (listing.status !== 'published') {
    return <ListingPageClient />;
  }

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: listing.title,
    description: listing.description,
    url: `${SITE_URL}/listings/${id}`,
    image: listing.images?.[0],
    serviceType: listing.productLabels?.join('・') || listing.category,
    areaServed: listing.areaLabels?.length ? listing.areaLabels : ['全国'],
    provider: {
      '@type': 'Organization',
      name: listing.companyName,
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: SITE_URL },
      {
        '@type': 'ListItem',
        position: 2,
        name: '案件一覧',
        item: `${SITE_URL}/listings`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: listing.title,
        item: `${SITE_URL}/listings/${id}`,
      },
    ],
  };

  return (
    <>
      <ListingPageClient initialListing={listing} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbJsonLd) }}
      />
    </>
  );
}
