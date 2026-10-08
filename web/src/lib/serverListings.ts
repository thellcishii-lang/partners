import 'server-only';
import { getAdminDb } from './firebaseAdmin';
import type { Listing } from '@/types';

export type FilterKey =
  | 'targetSlugs'
  | 'productSlugs'
  | 'modelSlugs'
  | 'prefectureSlug'
  | 'regionSlug'
  | 'initialCostRange'
  | 'expectedRevenueRange';

const ARRAY_FIELDS: FilterKey[] = ['targetSlugs', 'productSlugs', 'modelSlugs'];
const AREA_FIELDS: FilterKey[] = ['prefectureSlug', 'regionSlug'];

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
  } else if (AREA_FIELDS.includes(filterKey)) {
    if (filterValue === 'all') {
      withFilter = base.where(filterKey, '==', 'all');
    } else {
      withFilter = base.where(filterKey, 'in', [filterValue, 'all']);
    }
  } else {
    withFilter = base.where(filterKey, '==', filterValue);
  }

  const snap = await withFilter.orderBy('publishedAt', 'desc').limit(limit).get();
  return snap.docs.map((d) => ({ ...d.data(), id: d.id } as Listing));
}
