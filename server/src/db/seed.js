// Seed script: run with `npm run db:seed`.
// Copies the starting content from seedData.js into the database.
//
// It is safe to run more than once: "on conflict do update" means a row whose id
// already exists is updated instead of being inserted twice.

import { db } from './index.js'
import { galleryPhotos, services } from './schema.js'
import * as seedData from './seedData.js'

// The array position becomes sortOrder, so the page keeps the same order as the file.
for (const [index, service] of seedData.services.entries()) {
  const row = { enquiryType: null, ...service, sortOrder: index }
  await db.insert(services).values(row).onConflictDoUpdate({ target: services.id, set: row })
}

for (const [index, photo] of seedData.galleryPhotos.entries()) {
  const row = { ...photo, sortOrder: index }
  await db.insert(galleryPhotos).values(row).onConflictDoUpdate({ target: galleryPhotos.id, set: row })
}

console.log(`Seeded ${seedData.services.length} services and ${seedData.galleryPhotos.length} gallery photos.`)
process.exit(0)
