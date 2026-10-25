// The Stripe client the server uses to start payments and check webhooks.
//
// STRIPE_SECRET_KEY comes from the Stripe dashboard (Developers -> API keys). In TEST mode it
// starts with sk_test_ and no real money moves. It is secret: it lives only in .env, never in the browser.
// Without it, `stripe` is null and the checkout route explains that payments are not set up.

import Stripe from 'stripe'

export const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null
