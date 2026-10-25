import { Router } from 'express'
import { asc, count, desc, eq, sql } from 'drizzle-orm'
import { db } from '../db/index.js'
import { bookings, enquiries, enquiryReplies, orderItems, orders, services, user } from '../db/schema.js'
import { isEmailConfigured, sendEmail } from '../email.js'
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
  const replyRows = await db.select().from(enquiryReplies).orderBy(asc(enquiryReplies.createdAt))

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

  // Orders with who placed them, plus each order's lines.
  const orderRows = await db
    .select({
      id: orders.id,
      status: orders.status,
      total: orders.total,
      createdAt: orders.createdAt,
      paidAt: orders.paidAt,
      userName: user.name,
      userEmail: user.email,
    })
    .from(orders)
    .innerJoin(user, eq(orders.userId, user.id))
    .orderBy(desc(orders.createdAt))
  const itemRows = await db.select().from(orderItems)

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
      paidRevenue: orderRows.filter((order) => order.status === 'paid').reduce((sum, order) => sum + order.total, 0),
    },
    // Each enquiry carries the replies sent to it, oldest first.
    enquiries: enquiryRows.map((enquiry) => ({
      ...enquiry,
      replies: replyRows.filter((reply) => reply.enquiryId === enquiry.id),
    })),
    bookings: bookingRows,
    orders: orderRows.map((order) => ({ ...order, items: itemRows.filter((item) => item.orderId === order.id) })),
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

// POST /api/admin/enquiries/:id/replies  body: { message: 'Hi Anna, thanks for...' }
// Emails the reply to the person who sent the enquiry, saves a copy, and marks the enquiry 'replied'.
router.post('/enquiries/:id/replies', async (req, res) => {
  const message = req.body?.message?.trim()
  if (!message) return res.status(400).json({ error: 'Please write a reply first' })
  if (!isEmailConfigured()) {
    return res.status(503).json({ error: 'Email sending is not set up yet (RESEND_API_KEY / EMAIL_FROM are missing)' })
  }

  const [enquiry] = await db.select().from(enquiries).where(eq(enquiries.id, Number(req.params.id)))
  if (!enquiry) return res.status(404).json({ error: 'Enquiry not found' })

  // Send first, save second: if the email fails, nothing is saved and the admin sees why.
  // The customer's original message is quoted underneath, like a normal email reply.
  const sentOn = enquiry.createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const quoted = enquiry.message.replace(/^/gm, '> ')
  try {
    await sendEmail({
      to: enquiry.email,
      subject: `Re: your ${enquiry.shootType.toLowerCase()} enquiry - Lens Theory`,
      text: `${message}\n\n---\nOn ${sentOn} you wrote:\n${quoted}`,
      replyTo: req.user.email, // the customer's answer lands in this admin's inbox
    })
  } catch (error) {
    return res.status(502).json({ error: `The email was not sent: ${error.message}` })
  }

  const [reply] = await db
    .insert(enquiryReplies)
    .values({ enquiryId: enquiry.id, message: message.slice(0, 10000), sentBy: req.user.email })
    .returning()
  await db.update(enquiries).set({ status: 'replied' }).where(eq(enquiries.id, enquiry.id))

  res.status(201).json(reply)
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
