import { Router } from 'express'
import { desc, eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { bookings, services } from '../db/schema.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { priceBasket } from '../basket.js'

const router = Router()

// Every route in this file needs a signed-in user.
router.use(requireAuth)

// GET /api/bookings -> the signed-in user's own booking requests, newest first.
router.get('/', async (req, res) => {
  const rows = await db
    .select({
      id: bookings.id,
      serviceName: services.name,
      hours: bookings.hours,
      pricePerHour: bookings.pricePerHour,
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .innerJoin(services, eq(bookings.serviceId, services.id))
    .where(eq(bookings.userId, req.user.id))
    .orderBy(desc(bookings.createdAt))

  res.json(rows)
})

// POST /api/bookings  body: { items: [{ serviceId: 'portraits', hours: 2 }, ...] }
// Saves one row per basket line. priceBasket() checks the basket and looks up the real prices.
// (The basket now pays through /api/checkout instead; this older route is kept for booking requests.)
router.post('/', async (req, res) => {
  const { error, lines } = await priceBasket(req.body?.items)
  if (error) return res.status(400).json({ error })

  const rows = lines.map(({ service, hours }) => ({
    userId: req.user.id,
    serviceId: service.id,
    hours,
    pricePerHour: service.pricePerHour,
  }))

  const saved = await db.insert(bookings).values(rows).returning()
  res.status(201).json(saved)
})

export default router
