import { randomUUID } from 'node:crypto'
import { Router } from 'express'
import { asc, eq, sql } from 'drizzle-orm'
import { db } from '../db/index.js'
import { galleryPhotos } from '../db/schema.js'
import { adminOnly } from '../middleware/requireAdmin.js'

const SHAPES = ['tall', 'portrait', 'square']

const router = Router()

// GET /api/photos -> every gallery photo, in page order, as JSON. Anyone may ask.
// SQL equivalent: SELECT * FROM gallery_photos ORDER BY sort_order;
router.get('/', async (req, res) => {
  const rows = await db.select().from(galleryPhotos).orderBy(asc(galleryPhotos.sortOrder))
  res.json(rows)
})

// ---- Everything below is for admins only (the dashboard's "Gallery" tab) ----

// Checks a photo sent by the dashboard. Returns { error } or { photo } with only the fields we store.
function readPhoto(body) {
  const src = body?.src?.trim()
  const alt = body?.alt?.trim()
  const category = body?.category?.trim()

  if (!src) return { error: 'Please add an image' }
  if (!alt) return { error: 'Please describe the photo (alt text), for people using screen readers' }
  if (!category) return { error: 'Please give the photo a category' }
  if (!SHAPES.includes(body.shape)) return { error: `Shape must be one of: ${SHAPES.join(', ')}` }

  return { photo: { src, alt, category, shape: body.shape } }
}

// POST /api/photos  body: { src, alt, category, shape } -> adds a photo at the end of the gallery.
router.post('/', adminOnly, async (req, res) => {
  const { error, photo } = readPhoto(req.body)
  if (error) return res.status(400).json({ error })

  // The new photo goes last: one more than the biggest sort_order so far.
  const [{ nextOrder }] = await db
    .select({ nextOrder: sql`coalesce(max(${galleryPhotos.sortOrder}) + 1, 0)`.mapWith(Number) })
    .from(galleryPhotos)

  const [saved] = await db
    .insert(galleryPhotos)
    .values({ id: `photo-${randomUUID()}`, ...photo, sortOrder: nextOrder })
    .returning()

  res.status(201).json(saved)
})

// PUT /api/photos/order  body: { ids: ['photo-3', 'photo-1', ...] } -> saves a new gallery order.
// (Defined before PUT /:id, otherwise Express would treat "order" as a photo id.)
router.put('/order', adminOnly, async (req, res) => {
  const ids = req.body?.ids
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'Send the photo ids in their new order' })

  for (const [index, id] of ids.entries()) {
    await db.update(galleryPhotos).set({ sortOrder: index }).where(eq(galleryPhotos.id, id))
  }
  res.json({ ok: true })
})

// PUT /api/photos/:id  body: { src, alt, category, shape } -> changes one photo.
router.put('/:id', adminOnly, async (req, res) => {
  const { error, photo } = readPhoto(req.body)
  if (error) return res.status(400).json({ error })

  const [updated] = await db.update(galleryPhotos).set(photo).where(eq(galleryPhotos.id, req.params.id)).returning()

  if (!updated) return res.status(404).json({ error: 'Photo not found' })
  res.json(updated)
})

// DELETE /api/photos/:id -> removes a photo from the gallery.
router.delete('/:id', adminOnly, async (req, res) => {
  const [deleted] = await db.delete(galleryPhotos).where(eq(galleryPhotos.id, req.params.id)).returning()

  if (!deleted) return res.status(404).json({ error: 'Photo not found' })
  res.json(deleted)
})

export default router
