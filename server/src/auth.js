// Better Auth setup. This one object handles signup, login, logout and sessions.
// index.js sends every request under /api/auth/* to it.

import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db/index.js'
import { account, session, user, verification } from './db/schema.js'

export const auth = betterAuth({
  // Where Better Auth stores users and sessions: our Postgres database, via Drizzle.
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: { user, session, account, verification },
  }),

  // Turn on signup/login with email + password. Passwords are hashed before saving.
  emailAndPassword: { enabled: true, minPasswordLength: 8 },

  // Sessions last 7 days. The cookie survives page refreshes and browser restarts.
  session: { expiresIn: 60 * 60 * 24 * 7 },

  // BETTER_AUTH_SECRET (used to sign cookies) and BETTER_AUTH_URL are read from .env automatically.
  // Only requests coming from these websites may log in (protects against other sites faking requests).
  trustedOrigins: [...(process.env.CLIENT_ORIGIN ?? 'http://localhost:5173').split(','), ...vercelOrigins()],
})

// On Vercel, the site and the API share one domain. Vercel tells us that domain in these
// variables (production, branch preview and this exact deployment), so we trust them too.
// Locally none of them exist and this returns an empty list.
function vercelOrigins() {
  return [process.env.VERCEL_PROJECT_PRODUCTION_URL, process.env.VERCEL_BRANCH_URL, process.env.VERCEL_URL]
    .filter(Boolean)
    .map((host) => `https://${host}`)
}
