import { Router } from 'express'
import { eq } from 'drizzle-orm'
import { priceBasket } from '../basket.js'
import { db } from '../db/index.js'
import { orderItems, orders } from '../db/schema.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { stripe } from '../stripe.js'

const router = Router()

// POST /api/checkout  body: { items: [{ serviceId: 'portraits', hours: 2 }, ...] }
// -> { url: 'https://checkout.stripe.com/...' }  (the browser then goes to that page to pay)
//
// requireAuth first: every order must belong to a real, signed-in user.
// The steps, in order:
//   1. look up the REAL prices in our database (never trust prices sent by the browser)
//   2. save the order as 'pending', with one order_items row per basket line
//   3. ask Stripe for a Checkout Session (Stripe's own payment page) for that order
//   4. send the page's URL back to the browser
// Nothing here marks the order as paid: only the webhook (routes/stripe.js) may do that.
router.post('/', requireAuth, async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Payments are not set up yet (STRIPE_SECRET_KEY is missing)' })

  // 1. Real prices
  const { error, lines } = await priceBasket(req.body?.items)
  if (error) return res.status(400).json({ error })

  const total = lines.reduce((sum, { service, hours }) => sum + service.pricePerHour * hours, 0)

  // 2. The order and its lines
  const [order] = await db.insert(orders).values({ userId: req.user.id, total }).returning()
  await db.insert(orderItems).values(
    lines.map(({ service, hours }) => ({
      orderId: order.id,
      serviceId: service.id,
      serviceName: service.name,
      hours,
      pricePerHour: service.pricePerHour,
    })),
  )

  // 3. The Stripe Checkout Session. Stripe counts money in the smallest unit (pence), so £150 = 15000.
  // Each line is "N hours of <service>", so quantity = hours and the unit price = the hourly price.
  // BETTER_AUTH_URL is the address of the website, where Stripe sends the customer back afterwards.
  const siteUrl = process.env.BETTER_AUTH_URL
  let session
  try {
    session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: req.user.email,
      line_items: lines.map(({ service, hours }) => ({
        quantity: hours,
        price_data: {
          currency: 'gbp',
          unit_amount: service.pricePerHour * 100,
          product_data: { name: `${service.name} (per hour)` },
        },
      })),
      // The webhook reads this to know WHICH order was paid.
      metadata: { orderId: String(order.id) },
      success_url: `${siteUrl}/order/success?order=${order.id}`,
      cancel_url: `${siteUrl}/?checkout=cancelled#services`,
    })
  } catch (error) {
    // e.g. a mistyped STRIPE_SECRET_KEY. The order stays 'pending' and is simply never paid.
    console.error('Stripe checkout failed:', error.message)
    return res.status(502).json({ error: `Could not start the payment: ${error.message}` })
  }

  // Remember the session on the order, so the two can always be matched up.
  await db.update(orders).set({ stripeSessionId: session.id }).where(eq(orders.id, order.id))

  // 4. Off to Stripe
  res.status(201).json({ url: session.url })
})

export default router
