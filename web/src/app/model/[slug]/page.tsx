import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FilteredListingList } from '@/components/listings/FilteredListingList';
import { MODEL_LABELS } from '@/lib/masterLabels';

export const revalidate = 3600;

export async function generateStaticParams() {
  return Object.keys(MODEL_LABELS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const label = MODEL_LABELS[slug];
  if (!label) return { title: '代理店募集・加盟店募集.com' };
  return {
    title: `${label}代理店募集・加盟店募集`,
    description: `${label}の代理店・加盟店を募集している企業の一覧です。`,
  };
}

export default async function ModelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const label = MODEL_LABELS[slug];
  if (!label) notFound();

  return (
    <FilteredListingList
      filterKey="modelSlugs"
      filterValue={slug}
      heading={`${label}の代理店募集・加盟店募集`}
      description={`${label}の代理店・加盟店を募集している企業の一覧です。`}
    />
  );
}
