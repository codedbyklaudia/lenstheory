import { Router } from 'express'
import { asc, count, eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { bookings, services } from '../db/schema.js'
import { adminOnly } from '../middleware/requireAdmin.js'
import { SHOOT_TYPES } from './enquiries.js'

const router = Router()

// GET /api/services -> every service, in page order, as JSON. Anyone may ask.
// SQL equivalent: SELECT * FROM services ORDER BY sort_order;
router.get('/', async (req, res) => {
  const rows = await db.select().from(services).orderBy(asc(services.sortOrder))
  res.json(rows)
})

// ---- Everything below is for admins only (the dashboard's "Services" tab) ----

// Checks a service sent by the dashboard. Returns { error } or { service } with only the fields we store.
function readService(body = {}) {
  const text = (value) => (typeof value === 'string' ? value.trim() : '')
  const name = text(body.name)
  const bookable = body.bookable === true
  const pricePerHour = Number(body.pricePerHour)

  if (!name) return { error: 'Please give the service a name' }
  if (!text(body.description)) return { error: 'Please add a short description' }
  if (!text(body.image)) return { error: 'Please add an image' }
  if (bookable && (!Number.isInteger(pricePerHour) || pricePerHour < 1)) {
    return { error: 'A bookable service needs a price per hour (whole pounds)' }
  }
  if (body.enquiryType && !SHOOT_TYPES.includes(body.enquiryType)) {
    return { error: `Enquiry type must be one of: ${SHOOT_TYPES.join(', ')}` }
  }

  // Lists: drop empty lines, so a blank "Add item" row is simply ignored.
  const features = (Array.isArray(body.features) ? body.features : []).map(text).filter(Boolean)
  const terms = (Array.isArray(body.terms) ? body.terms : [])
    .map((term) => ({ heading: text(term?.heading), text: text(term?.text) }))
    .filter((term) => term.heading || term.text)

  return {
    service: {
      name,
      description: text(body.description),
      image: text(body.image),
      alt: text(body.alt) || name,
      bookable,
      pricePerHour: bookable ? pricePerHour : null,
      enquiryType: body.enquiryType || null,
      features,
      terms: terms.length > 0 ? terms : null, // no terms -> no "View more details" link on the card
    },
  }
}

// Turns a name into a readable id for the URL and database: "Pet portraits!" -> "pet-portraits".
const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

// POST /api/services  body: { name, description, image, ... } -> adds a service at the end.
router.post('/', adminOnly, async (req, res) => {
  const { error, service } = readService(req.body)
  if (error) return res.status(400).json({ error })

  const id = slugify(service.name)
  const all = await db.select({ id: services.id, sortOrder: services.sortOrder }).from(services)

  if (!id) return res.status(400).json({ error: 'The name needs at least one letter or number' })
  if (all.some((row) => row.id === id)) return res.status(409).json({ error: 'A service with that name already exists' })

  const sortOrder = Math.max(-1, ...all.map((row) => row.sortOrder)) + 1
  const [saved] = await db.insert(services).values({ id, ...service, sortOrder }).returning()
  res.status(201).json(saved)
})

// PUT /api/services/order  body: { ids: ['family', 'portraits', ...] } -> saves a new order.
// (Defined before PUT /:id, otherwise Express would treat "order" as a service id.)
router.put('/order', adminOnly, async (req, res) => {
  const ids = req.body?.ids
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'Send the service ids in their new order' })

  for (const [index, id] of ids.entries()) {
    await db.update(services).set({ sortOrder: index }).where(eq(services.id, id))
  }
  res.json({ ok: true })
})

// PUT /api/services/:id -> changes one service. The id stays the same even if the name changes,
// because existing bookings point at it.
// Bookings already made keep the price they were made at (it is copied into the booking).
router.put('/:id', adminOnly, async (req, res) => {
  const { error, service } = readService(req.body)
  if (error) return res.status(400).json({ error })

  const [updated] = await db.update(services).set(service).where(eq(services.id, req.params.id)).returning()

  if (!updated) return res.status(404).json({ error: 'Service not found' })
  res.json(updated)
})

// DELETE /api/services/:id -> removes a service, but only if nobody has booked it.
// (A booking must always point at a real service, so the database would refuse anyway.)
router.delete('/:id', adminOnly, async (req, res) => {
  const [{ bookingCount }] = await db
    .select({ bookingCount: count() })
    .from(bookings)
    .where(eq(bookings.serviceId, req.params.id))

  if (bookingCount > 0) {
    return res.status(409).json({ error: `This service has ${bookingCount} booking(s), so it cannot be deleted` })
  }

  const [deleted] = await db.delete(services).where(eq(services.id, req.params.id)).returning()

  if (!deleted) return res.status(404).json({ error: 'Service not found' })
  res.json(deleted)
})

export default router
