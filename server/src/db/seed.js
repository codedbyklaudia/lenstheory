// Seed script: run with `npm run db:seed`.
// Copies the starting services and gallery photos from seedData.js into the database.
//
// It is safe to run more than once: "on conflict do nothing" skips any row whose id already
// exists, so it never overwrites changes an admin has made in the dashboard.
// (The page text in seedData.siteContent is not copied: the API uses it as the default.)

import { db } from './index.js'
import { galleryPhotos, services } from './schema.js'
import * as seedData from './seedData.js'

// The array position becomes sortOrder, so the page keeps the same order as the file.
for (const [index, service] of seedData.services.entries()) {
  const row = { enquiryType: null, ...service, sortOrder: index }
  await db.insert(services).values(row).onConflictDoNothing()
}

for (const [index, photo] of seedData.galleryPhotos.entries()) {
  const row = { ...photo, sortOrder: index }
  await db.insert(galleryPhotos).values(row).onConflictDoNothing()
}

console.log(`Seeded ${seedData.services.length} services and ${seedData.galleryPhotos.length} gallery photos (existing rows were left alone).`)
process.exit(0)
