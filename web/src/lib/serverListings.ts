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

export async function getServerListings(
  filterKey: FilterKey,
  filterValue: string,
  limit = 60,
): Promise<Listing[]> {
  const db = getAdminDb();
  const base = db.collection('listings').where('status', '==', 'published');

  const withFilter = ARRAY_FIELDS.includes(filterKey)
    ? base.where(filterKey, 'array-contains', filterValue)
    : base.where(filterKey, '==', filterValue);

  const snap = await withFilter
    .orderBy('publishedAt', 'desc')
    .limit(limit)
    .get();

  return snap.docs.map((d) => ({ ...d.data(), id: d.id } as Listing));
}
