// 実行: functions/ ディレクトリで npm run seed:masters
// 前提: エミュレータ起動中、または本番の認証情報が通っていること
//
// エミュレータ:
//   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 GCLOUD_PROJECT=demo-partners npm run seed:masters
// 本番:
//   GCLOUD_PROJECT=partners-ab2a3 npm run seed:masters

import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import {
  AREAS,
  CATEGORIES,
  COST_RANGES,
} from '../web/src/lib/masterData.ts';

if (getApps().length === 0) {
  initializeApp();
}
const db = getFirestore();

const now = new Date();
const categories = CATEGORIES.map((category) => ({
  ...category,
  isActive: true,
  createdAt: now,
  updatedAt: now,
}));
const areas = AREAS.map((area) => ({
  ...area,
  isActive: true,
  createdAt: now,
  updatedAt: now,
}));
const costRanges = COST_RANGES.map((costRange) => ({
  ...costRange,
  isActive: true,
  createdAt: now,
  updatedAt: now,
}));

async function seed() {
  console.log('Seeding masters...');

  const BATCH_SIZE = 400;

  async function commitAll(collectionName, items) {
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const batch = db.batch();
      for (const item of items.slice(i, i + BATCH_SIZE)) {
        batch.set(db.collection(collectionName).doc(item.slug), item, { merge: true });
      }
      await batch.commit();
    }
  }

  await commitAll('categories', categories);
  await commitAll('areas', areas);
  await commitAll('costRanges', costRanges);

  console.log(`✓ categories: ${categories.length}件`);
  console.log(`   - target:  ${categories.filter((category) => category.axis === 'target').length}`);
  console.log(`   - product: ${categories.filter((category) => category.axis === 'product').length}`);
  console.log(`   - model:   ${categories.filter((category) => category.axis === 'model').length}`);
  console.log(`✓ areas: ${areas.length}件`);
  console.log(`   - region:     ${areas.filter((area) => area.type === 'region').length}`);
  console.log(`   - prefecture: ${areas.filter((area) => area.type === 'prefecture').length}`);
  console.log(`✓ costRanges: ${costRanges.length}件`);
  console.log('Done.');
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
