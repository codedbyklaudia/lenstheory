import { Router } from 'express'
import { count, desc, eq, sql } from 'drizzle-orm'
import { db } from '../db/index.js'
import { bookings, enquiries, services, user } from '../db/schema.js'
import { isAdmin, requireAdmin } from '../middleware/requireAdmin.js'
import { requireAuth } from '../middleware/requireAuth.js'

const ENQUIRY_STATUSES = ['new', 'replied']
const BOOKING_STATUSES = ['requested', 'confirmed', 'cancelled']

const router = Router()

// Every admin route needs a signed-in user...
router.use(requireAuth)

// GET /api/admin/check -> { isAdmin: true/false }
// Any signed-in user may ask; the frontend uses it to decide whether to show the dashboard link.
router.get('/check', (req, res) => {
  res.json({ isAdmin: isAdmin(req.user) })
})

// ...and everything below this line also needs that user to be an admin.
router.use(requireAdmin)

// GET /api/admin/overview -> the totals and the three lists the dashboard shows.
router.get('/overview', async (req, res) => {
  const enquiryRows = await db.select().from(enquiries).orderBy(desc(enquiries.createdAt))

  // Bookings joined with who booked and what they booked.
  const bookingRows = await db
    .select({
      id: bookings.id,
      hours: bookings.hours,
      pricePerHour: bookings.pricePerHour,
      status: bookings.status,
      createdAt: bookings.createdAt,
      serviceName: services.name,
      userName: user.name,
      userEmail: user.email,
    })
    .from(bookings)
    .innerJoin(services, eq(bookings.serviceId, services.id))
    .innerJoin(user, eq(bookings.userId, user.id))
    .orderBy(desc(bookings.createdAt))

  // Users with how many bookings each has made (LEFT JOIN keeps users with none).
  const userRows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      bookingCount: count(bookings.id),
    })
    .from(user)
    .leftJoin(bookings, eq(bookings.userId, user.id))
    .groupBy(user.id)
    .orderBy(desc(user.createdAt))

  // Value of every booking that is not cancelled: SUM(hours * price_per_hour).
  const [{ requestedValue }] = await db
    .select({ requestedValue: sql`coalesce(sum(${bookings.hours} * ${bookings.pricePerHour}), 0)`.mapWith(Number) })
    .from(bookings)
    .where(sql`${bookings.status} <> 'cancelled'`)

  res.json({
    stats: {
      users: userRows.length,
      bookings: bookingRows.length,
      newEnquiries: enquiryRows.filter((enquiry) => enquiry.status === 'new').length,
      requestedValue,
    },
    enquiries: enquiryRows,
    bookings: bookingRows,
    users: userRows.map((row) => ({ ...row, isAdmin: isAdmin(row) })),
  })
})

// PATCH /api/admin/enquiries/:id  body: { status: 'replied' }
router.patch('/enquiries/:id', async (req, res) => {
  const { status } = req.body ?? {}
  if (!ENQUIRY_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${ENQUIRY_STATUSES.join(', ')}` })
  }

  const [updated] = await db
    .update(enquiries)
    .set({ status })
    .where(eq(enquiries.id, Number(req.params.id)))
    .returning()

  if (!updated) return res.status(404).json({ error: 'Enquiry not found' })
  res.json(updated)
})

// PATCH /api/admin/bookings/:id  body: { status: 'confirmed' }
router.patch('/bookings/:id', async (req, res) => {
  const { status } = req.body ?? {}
  if (!BOOKING_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${BOOKING_STATUSES.join(', ')}` })
  }

  const [updated] = await db
    .update(bookings)
    .set({ status })
    .where(eq(bookings.id, Number(req.params.id)))
    .returning()

  if (!updated) return res.status(404).json({ error: 'Booking not found' })
  res.json(updated)
})

export default router
