import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FilteredListingList } from '@/components/listings/FilteredListingList';
import { INITIAL_COST_LABELS } from '@/lib/masterLabels';

export const revalidate = 3600;

export async function generateStaticParams() {
  return Object.keys(INITIAL_COST_LABELS).map((range) => ({ range }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ range: string }>;
}): Promise<Metadata> {
  const { range } = await params;
  const label = INITIAL_COST_LABELS[range];
  if (!label) return { title: '代理店募集・加盟店募集.com' };
  return {
    title: `${label}の代理店募集・加盟店募集`,
    description: `初期費用が${label}の代理店・加盟店を募集している企業の一覧です。登録3ヶ月無料、デポジット型。`,
    openGraph: {
      title: `${label}の代理店募集・加盟店募集`,
      description: `初期費用${label}の代理店・加盟店の募集一覧。`,
    },
  };
}

export default async function CostInitialPage({
  params,
}: {
  params: Promise<{ range: string }>;
}) {
  const { range } = await params;
  const label = INITIAL_COST_LABELS[range];
  if (!label) notFound();

  return (
    <FilteredListingList
      filterKey="initialCostRange"
      filterValue={range}
      heading={`${label}の代理店募集・加盟店募集`}
      description={`初期費用が${label}の代理店・加盟店を募集している企業の一覧です。`}
    />
  );
}
