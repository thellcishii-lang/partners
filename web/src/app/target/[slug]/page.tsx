import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FilteredListingList } from '@/components/listings/FilteredListingList';
import { TARGET_LABELS } from '@/lib/masterLabels';

export const revalidate = 3600;

export async function generateStaticParams() {
  return Object.keys(TARGET_LABELS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const label = TARGET_LABELS[slug];
  if (!label) return { title: '代理店・加盟店募集.com' };
  return {
    title: `${label}向けの代理店・加盟店募集`,
    description: `${label}向けの商材を扱う代理店・加盟店を募集している企業の一覧です。`,
  };
}

export default async function TargetPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const label = TARGET_LABELS[slug];
  if (!label) notFound();

  return (
    <FilteredListingList
      filterKey="targetSlugs"
      filterValue={slug}
      heading={`${label}向けの代理店・加盟店募集`}
      description={`${label}向けの商材を扱う代理店・加盟店を募集している企業の一覧です。`}
    />
  );
}
