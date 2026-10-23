// The browser side of Better Auth. It calls our server's /api/auth/* routes for us.
//   authClient.signUp.email({ name, email, password })
//   authClient.signIn.email({ email, password })
//   authClient.signOut()
//   authClient.useSession()  -> React hook: { data: { user, session } | null, isPending }

import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  // Same address as the website itself: /api is forwarded to the Express server
  // (by Vite's proxy locally, and by vercel.json once deployed).
  baseURL: window.location.origin,
})
