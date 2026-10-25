import { Router } from 'express'
import { and, asc, desc, eq, inArray } from 'drizzle-orm'
import { db } from '../db/index.js'
import { orderItems, orders } from '../db/schema.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()

// Every route in this file needs a signed-in user, and only ever shows THEIR OWN orders.
router.use(requireAuth)

// GET /api/orders -> the signed-in user's orders, newest first, each with its lines.
// Used by the "My orders" tab on the account page (/account).
router.get('/', async (req, res) => {
  const rows = await db
    .select({ id: orders.id, status: orders.status, total: orders.total, createdAt: orders.createdAt, paidAt: orders.paidAt })
    .from(orders)
    .where(eq(orders.userId, req.user.id))
    .orderBy(desc(orders.createdAt))

  // All the lines of those orders in ONE query (WHERE order_id IN (...)), then shared out below.
  const orderIds = rows.map((order) => order.id)
  const items = orderIds.length > 0 ? await db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds)) : []

  res.json(rows.map((order) => ({ ...order, items: items.filter((item) => item.orderId === order.id) })))
})

// GET /api/orders/:id -> one order with its lines: { id, status, total, ..., items: [...] }
// The success page asks this a few times, because Stripe's webhook (which marks the order 'paid')
// can arrive a moment after the customer is sent back to our site.
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) return res.status(404).json({ error: 'Order not found' })

  // "and userId = me": someone else's order number gives 404, as if it did not exist.
  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, id), eq(orders.userId, req.user.id)))

  if (!order) return res.status(404).json({ error: 'Order not found' })

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id)).orderBy(asc(orderItems.id))

  // The Stripe session id is our business, not the customer's, so it is left out.
  const { stripeSessionId, ...publicOrder } = order
  res.json({ ...publicOrder, items })
})

export default router
