import { Router } from 'express'
import { fromNodeHeaders } from 'better-auth/node'
import { auth } from '../auth.js'
import { db } from '../db/index.js'
import { enquiries } from '../db/schema.js'

const SHOOT_TYPES = ['Portrait', 'Wedding', 'Family session', 'Something else']
const TIMES_OF_DAY = ['Flexible', 'Morning', 'Afternoon', 'Evening']

const router = Router()

// POST /api/enquiries  body: { name, email, shootType, preferredDate, timeOfDay, message }
// Saves a contact-form message. No sign-in needed, but if the visitor IS signed in we link it to them.
router.post('/', async (req, res) => {
  const { name, email, shootType, preferredDate, timeOfDay, message } = req.body ?? {}

  // Never trust the browser: check every field again here, even though the form already did.
  if (!name?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'Please fill in your name and a message' })
  }
  if (!/^\S+@\S+\.\S+$/.test(email ?? '')) {
    return res.status(400).json({ error: 'Please enter a valid email address' })
  }
  if (!SHOOT_TYPES.includes(shootType)) {
    return res.status(400).json({ error: 'Please choose what you are booking' })
  }
  if (preferredDate && !/^\d{4}-\d{2}-\d{2}$/.test(preferredDate)) {
    return res.status(400).json({ error: 'Please choose a valid date' })
  }

  // Optional sign-in: unlike requireAuth, a guest is fine here, so we only look the session up.
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) })

  const [saved] = await db
    .insert(enquiries)
    .values({
      name: name.trim().slice(0, 200),
      email: email.trim().slice(0, 200),
      shootType,
      preferredDate: preferredDate || null,
      timeOfDay: TIMES_OF_DAY.includes(timeOfDay) ? timeOfDay : 'Flexible',
      message: message.trim().slice(0, 5000),
      userId: session?.user.id ?? null,
    })
    .returning({ id: enquiries.id })

  res.status(201).json(saved)
})

export default router
