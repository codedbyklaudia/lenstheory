// The Express server: the entry point for `npm run dev` / `npm start`.
//
// Every URL the server answers starts with /api:
//   /api/auth/*      signup, login, logout, current session (handled by Better Auth)
//   /api/services    GET  the studio's services
//   /api/photos      GET  the gallery photos
//   /api/bookings    GET  my booking requests, POST a new one (must be signed in)
//   /api/enquiries   POST a contact-form message (anyone)
//   /api/admin/*     the admin dashboard's data and actions (admins only)
//   /api/health      GET  quick "is the server up?" check

import 'dotenv/config'
import express from 'express'
import { toNodeHandler } from 'better-auth/node'
import { auth } from './auth.js'
import adminRouter from './routes/admin.js'
import bookingsRouter from './routes/bookings.js'
import enquiriesRouter from './routes/enquiries.js'
import photosRouter from './routes/photos.js'
import servicesRouter from './routes/services.js'

const app = express()
const PORT = process.env.PORT ?? 3000

// Railway (and Vercel's proxy) sit in front of us, so trust their X-Forwarded-* headers.
app.set('trust proxy', true)

// Better Auth must come BEFORE express.json(), because it reads the request body itself.
app.all('/api/auth/{*any}', toNodeHandler(auth))

// Turns a JSON request body into a normal JS object on req.body.
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/services', servicesRouter)
app.use('/api/photos', photosRouter)
app.use('/api/bookings', bookingsRouter)
app.use('/api/enquiries', enquiriesRouter)
app.use('/api/admin', adminRouter)

// Any other /api URL: a JSON 404 instead of Express's default HTML page.
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }))

// If a route throws (e.g. the database is unreachable), answer with JSON instead of crashing.
app.use((error, req, res, next) => {
  console.error(error)
  res.status(500).json({ error: 'Something went wrong on the server' })
})

app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`))
