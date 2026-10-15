import 'server-only';
import { cache } from 'react';
import type { DocumentData } from 'firebase-admin/firestore';
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

function toTimestampValue(value: unknown): { seconds: number; nanoseconds: number } | null {
  if (!value || typeof value !== 'object') return null;

  const timestamp = value as { seconds?: unknown; nanoseconds?: unknown };
  if (typeof timestamp.seconds !== 'number' || typeof timestamp.nanoseconds !== 'number') {
    return null;
  }

  return {
    seconds: timestamp.seconds,
    nanoseconds: timestamp.nanoseconds,
  };
}

function toPublicListing(data: DocumentData, id: string): Listing {
  const {
    documents: _documents,
    pendingEdit: _pendingEdit,
    reviewNote: _reviewNote,
    ...publicData
  } = data;

  return {
    ...publicData,
    id,
    publishedAt: toTimestampValue(data.publishedAt),
    createdAt: toTimestampValue(data.createdAt),
    updatedAt: toTimestampValue(data.updatedAt),
    promotedTopUntil: toTimestampValue(data.promotedTopUntil),
    promotedRecommendUntil: toTimestampValue(data.promotedRecommendUntil),
  } as Listing;
}

export const getServerListing = cache(async (id: string): Promise<Listing | null> => {
  const snap = await getAdminDb().collection('listings').doc(id).get();
  return snap.exists ? toPublicListing(snap.data()!, snap.id) : null;
});

export async function getAllServerListings(): Promise<Listing[]> {
  const snap = await getAdminDb()
    .collection('listings')
    .where('status', '==', 'published')
    .get();

  return snap.docs.map((doc) => toPublicListing(doc.data(), doc.id));
}

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
  return snap.docs.map((doc) => toPublicListing(doc.data(), doc.id));
}
