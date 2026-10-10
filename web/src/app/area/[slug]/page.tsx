import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FilteredListingList } from '@/components/listings/FilteredListingList';
import { AREA_LABELS } from '@/lib/masterLabels';

export const revalidate = 3600;

export async function generateStaticParams() {
  return Object.keys(AREA_LABELS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const info = AREA_LABELS[slug];
  if (!info) return { title: '代理店・加盟店募集.com' };
  return {
    title: `${info.label}の代理店・加盟店募集`,
    description: `${info.label}エリアの代理店・加盟店を募集している企業の一覧です。登録3ヶ月無料、デポジット型で必要な問い合わせだけにお金を払う。`,
    openGraph: {
      title: `${info.label}の代理店・加盟店募集`,
      description: `${info.label}エリアの代理店・加盟店の募集一覧。`,
    },
  };
}

export default async function AreaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const info = AREA_LABELS[slug];
  if (!info) notFound();

  return (
    <FilteredListingList
      filterKey="area"
      filterValue={slug}
      heading={`${info.label}の代理店・加盟店募集`}
      description={`${info.label}エリアの代理店・加盟店を募集している企業の一覧です。`}
    />
  );
}
