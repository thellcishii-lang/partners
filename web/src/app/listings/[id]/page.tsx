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

export default function ListingPage() {
  return <ListingPageClient />;
}
