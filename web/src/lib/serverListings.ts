import 'server-only';
import { getAdminDb } from './firebaseAdmin';
import type { Listing } from '@/types';

export type FilterKey =
  | 'targetSlugs'
  | 'productSlugs'
  | 'modelSlugs'
  | 'area'
  | 'initialCostRange'
  | 'expectedRevenueRange';

const ARRAY_FIELDS: FilterKey[] = ['targetSlugs', 'productSlugs', 'modelSlugs'];

const REGION_SLUG_SET = new Set([
  'hokkaido', 'tohoku', 'kanto', 'chubu', 'kansai', 'chugoku', 'shikoku', 'kyushu',
]);

export async function getServerListings(
  filterKey: FilterKey,
  filterValue: string,
  limit = 60,
): Promise<Listing[]> {
  const db = getAdminDb();
  const base = db.collection('listings').where('status', '==', 'published');

  let withFilter;
  if (ARRAY_FIELDS.includes(filterKey)) {
    withFilter = base.where(filterKey, 'array-contains', filterValue);
  } else if (filterKey === 'area') {
    if (filterValue === 'all') {
      withFilter = base.where('areaMode', '==', 'nationwide');
    } else if (REGION_SLUG_SET.has(filterValue)) {
      withFilter = base.where('areaSearchRegionSlugs', 'array-contains', filterValue);
    } else {
      withFilter = base.where('areaSearchPrefectureSlugs', 'array-contains', filterValue);
    }
  } else {
    withFilter = base.where(filterKey, '==', filterValue);
  }

  const snap = await withFilter.orderBy('publishedAt', 'desc').limit(limit).get();
  return snap.docs.map((d) => ({ ...d.data(), id: d.id } as Listing));
}
