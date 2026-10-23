import { Router } from 'express'
import { desc, eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { bookings, services } from '../db/schema.js'
import { requireAuth } from '../middleware/requireAuth.js'

const MAX_HOURS = 10

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
// Saves one row per basket line. Prices come from the database, never from the browser,
// so nobody can change the price by editing the request.
router.post('/', async (req, res) => {
  const items = req.body?.items

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Your basket is empty' })
  }

  const allServices = await db.select().from(services)
  const rows = []

  for (const item of items) {
    const service = allServices.find((s) => s.id === item.serviceId)
    const hours = Number(item.hours)

    if (!service || !service.bookable) {
      return res.status(400).json({ error: `"${item.serviceId}" cannot be booked online` })
    }
    if (!Number.isInteger(hours) || hours < 1 || hours > MAX_HOURS) {
      return res.status(400).json({ error: `Hours must be between 1 and ${MAX_HOURS}` })
    }

    rows.push({ userId: req.user.id, serviceId: service.id, hours, pricePerHour: service.pricePerHour })
  }

  const saved = await db.insert(bookings).values(rows).returning()
  res.status(201).json(saved)
})

export default router
