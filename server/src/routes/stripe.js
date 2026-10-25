import express, { Router } from 'express'
import { and, eq, ne } from 'drizzle-orm'
import { db } from '../db/index.js'
import { orderItems, orders, shoots } from '../db/schema.js'
import { stripe } from '../stripe.js'

// The Stripe webhook: Stripe's servers call this URL to tell us what happened to a payment.
//
// Why not just mark the order paid when the customer lands on the success page? Because anyone can
// type that address into their browser without paying. This request, on the other hand, comes from
// Stripe and is SIGNED: Stripe adds a `Stripe-Signature` header made with STRIPE_WEBHOOK_SECRET,
// which only Stripe and our server know. constructEvent() checks it, so a fake "it's paid!" request
// is rejected. That is what makes this the ONLY place allowed to mark an order as 'paid'.
//
// The signature is calculated from the exact bytes Stripe sent, so this route needs the RAW body.
// That is why index.js plugs this router in BEFORE express.json() (which would turn it into an object).

const router = Router()

// POST /api/stripe/webhook  (called by Stripe, never by our own frontend)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(503).json({ error: 'Stripe webhooks are not set up (STRIPE_WEBHOOK_SECRET is missing)' })
  }

  // 1. Is this really from Stripe? If the signature does not match, stop here.
  let event
  try {
    event = stripe.webhooks.constructEvent(req.body, req.get('Stripe-Signature'), process.env.STRIPE_WEBHOOK_SECRET)
  } catch (error) {
    console.error('Stripe webhook signature check failed:', error.message)
    return res.status(400).json({ error: 'Invalid signature' })
  }

  // 2. Act on the events we care about. The session's metadata.orderId (set in routes/checkout.js)
  //    tells us which order it is; we also check the session id matches, to be extra sure.
  const session = event.data.object
  const isThisOrder = () =>
    and(eq(orders.id, Number(session.metadata?.orderId)), eq(orders.stripeSessionId, session.id))

  if (event.type === 'checkout.session.completed' && session.payment_status === 'paid') {
    // "status <> 'paid'": Stripe may send the same event twice. The second time nothing is updated,
    // `paid` is undefined, and so the sessions below are not created twice.
    const [paid] = await db
      .update(orders)
      .set({ status: 'paid', paidAt: new Date() })
      .where(and(isThisOrder(), ne(orders.status, 'paid')))
      .returning()

    if (paid) {
      console.log(`Order ${paid.id} paid (£${paid.total})`)

      // One photo session per line of the order, waiting for the studio to pick a date.
      // They appear in the customer's "My sessions" and the admin's "Sessions" tab.
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, paid.id))
      await db.insert(shoots).values(
        items.map((item) => ({
          userId: paid.userId,
          orderId: paid.id,
          serviceName: `${item.serviceName} (${item.hours} ${item.hours === 1 ? 'hour' : 'hours'})`,
        })),
      )
    }
  }

  // The customer left Stripe's page without paying, and the session timed out (after 24 hours).
  if (event.type === 'checkout.session.expired') {
    await db.update(orders).set({ status: 'expired' }).where(and(isThisOrder(), eq(orders.status, 'pending')))
  }

  // 3. Tell Stripe we received it. Without a 2xx answer, Stripe keeps retrying for days.
  res.json({ received: true })
})

export default router
