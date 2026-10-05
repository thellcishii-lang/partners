import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FilteredListingList } from '@/components/listings/FilteredListingList';
import { PRODUCT_LABELS } from '@/lib/masterLabels';

export const revalidate = 3600;

export async function generateStaticParams() {
  return Object.keys(PRODUCT_LABELS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const label = PRODUCT_LABELS[slug];
  if (!label) return { title: '代理店募集・加盟店募集.com' };
  return {
    title: `${label}の代理店募集・加盟店募集`,
    description: `${label}商材の代理店・加盟店を募集している企業の一覧です。登録3ヶ月無料、デポジット型で必要な問い合わせだけにお金を払う。`,
    openGraph: {
      title: `${label}の代理店募集・加盟店募集`,
      description: `${label}商材の代理店・加盟店の募集一覧。`,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const label = PRODUCT_LABELS[slug];
  if (!label) notFound();

  return (
    <FilteredListingList
      filterKey="productSlugs"
      filterValue={slug}
      heading={`${label}の代理店募集・加盟店募集`}
      description={`${label}商材を扱う代理店・加盟店を募集している企業の一覧です。`}
    />
  );
}
