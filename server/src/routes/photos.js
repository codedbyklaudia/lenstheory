import { Router } from 'express'
import { asc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { galleryPhotos } from '../db/schema.js'

const router = Router()

// GET /api/photos -> every gallery photo, in page order, as JSON.
// SQL equivalent: SELECT * FROM gallery_photos ORDER BY sort_order;
router.get('/', async (req, res) => {
  const rows = await db.select().from(galleryPhotos).orderBy(asc(galleryPhotos.sortOrder))
  res.json(rows)
})

export default router
