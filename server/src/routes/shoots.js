import { Router } from 'express'
import { asc, desc, eq, inArray } from 'drizzle-orm'
import { db } from '../db/index.js'
import { clientPhotos, shoots, user } from '../db/schema.js'
import { isEmailConfigured, sendEmail } from '../email.js'
import { adminOnly } from '../middleware/requireAdmin.js'
import { requireAuth } from '../middleware/requireAuth.js'

// Photo sessions ("shoots") and the photos delivered for them.
//   Customers: GET /api/shoots -> their own sessions (the account page's "My sessions" and "My gallery")
//   Admins:    everything else (the dashboard's "Sessions" tab)

const STATUSES = ['unscheduled', 'scheduled', 'delivered']

const router = Router()

// Adds each shoot's photos to it: { ...shoot, photos: [...] }. One query for all of them.
async function withPhotos(shootRows, { onlyDelivered = false } = {}) {
  const ids = shootRows.filter((shoot) => !onlyDelivered || shoot.status === 'delivered').map((shoot) => shoot.id)
  const photoRows = ids.length > 0 ? await db.select().from(clientPhotos).where(inArray(clientPhotos.shootId, ids)).orderBy(asc(clientPhotos.id)) : []
  return shootRows.map((shoot) => ({ ...shoot, photos: photoRows.filter((photo) => photo.shootId === shoot.id) }))
}

// GET /api/shoots -> the signed-in customer's own sessions, newest first.
// Photos are only included once a shoot is 'delivered', so the studio can upload them
// bit by bit and the customer sees the finished set all at once.
router.get('/', requireAuth, async (req, res) => {
  const rows = await db.select().from(shoots).where(eq(shoots.userId, req.user.id)).orderBy(desc(shoots.createdAt))
  res.json(await withPhotos(rows, { onlyDelivered: true }))
})

// ---- Admins only ----------------------------------------------------------------

// GET /api/shoots/all -> every customer's sessions, with who they belong to and ALL their photos.
router.get('/all', adminOnly, async (req, res) => {
  const rows = await db
    .select({ shoot: shoots, userName: user.name, userEmail: user.email })
    .from(shoots)
    .innerJoin(user, eq(shoots.userId, user.id))
    .orderBy(desc(shoots.createdAt))

  const flat = rows.map((row) => ({ ...row.shoot, userName: row.userName, userEmail: row.userEmail }))
  res.json(await withPhotos(flat))
})

// POST /api/shoots  body: { userId, serviceName } -> adds a session by hand (e.g. after a wedding enquiry).
router.post('/', adminOnly, async (req, res) => {
  const serviceName = req.body?.serviceName?.trim()
  if (!serviceName) return res.status(400).json({ error: 'Please name the session, e.g. "Wedding (full day)"' })

  const [client] = await db.select().from(user).where(eq(user.id, String(req.body?.userId)))
  if (!client) return res.status(400).json({ error: 'Please choose a client' })

  const [created] = await db.insert(shoots).values({ userId: client.id, serviceName }).returning()
  res.status(201).json({ ...created, userName: client.name, userEmail: client.email, photos: [] })
})

// PATCH /api/shoots/:id  body: { status, scheduledAt, location, notes } -> plan or deliver a session.
// When the status changes to 'scheduled' or 'delivered', the customer gets an email (if email is set up).
router.patch('/:id', adminOnly, async (req, res) => {
  const { status, scheduledAt, location, notes } = req.body ?? {}
  if (!STATUSES.includes(status)) return res.status(400).json({ error: `Status must be one of: ${STATUSES.join(', ')}` })

  const date = scheduledAt ? new Date(scheduledAt) : null
  if (date && Number.isNaN(date.getTime())) return res.status(400).json({ error: 'Please choose a valid date and time' })
  if (status === 'scheduled' && !date) return res.status(400).json({ error: 'A scheduled session needs a date and time' })

  const [before] = await db.select().from(shoots).where(eq(shoots.id, Number(req.params.id)))
  if (!before) return res.status(404).json({ error: 'Session not found' })

  const [updated] = await db
    .update(shoots)
    .set({ status, scheduledAt: date, location: location?.trim() || null, notes: notes?.trim() || null })
    .where(eq(shoots.id, before.id))
    .returning()

  // Let the customer know. A failed email must not undo the change, so we only log it.
  let emailed = false
  if (status !== before.status && status !== 'unscheduled' && isEmailConfigured()) {
    const [client] = await db.select().from(user).where(eq(user.id, updated.userId))
    try {
      await sendEmail({ to: client.email, replyTo: req.user.email, ...statusEmail(updated, client) })
      emailed = true
    } catch (error) {
      console.error('Could not email the customer:', error.message)
    }
  }

  res.json({ ...updated, emailed })
})

function statusEmail(shoot, client) {
  const firstName = client.name.trim().split(/\s+/)[0]
  const siteUrl = process.env.BETTER_AUTH_URL

  if (shoot.status === 'delivered') {
    return {
      subject: 'Your photos are ready - Lens Theory',
      text: `Hi ${firstName},\n\nThe photos from your ${shoot.serviceName} session are ready!\nSee and download them in your gallery: ${siteUrl}/account?tab=gallery\n\nLens Theory`,
    }
  }

  const when = shoot.scheduledAt.toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Europe/London' })
  return {
    subject: 'Your session is booked - Lens Theory',
    text: `Hi ${firstName},\n\nYour ${shoot.serviceName} session is booked for ${when}${shoot.location ? ` at ${shoot.location}` : ''}.${
      shoot.notes ? `\n\n${shoot.notes}` : ''
    }\n\nAll the details are in your account: ${siteUrl}/account?tab=sessions\n\nLens Theory`,
  }
}

// DELETE /api/shoots/photos/:photoId -> removes one delivered photo.
// (Defined before DELETE /:id, so "photos" is never mistaken for a session id.)
router.delete('/photos/:photoId', adminOnly, async (req, res) => {
  const [deleted] = await db.delete(clientPhotos).where(eq(clientPhotos.id, Number(req.params.photoId))).returning()
  if (!deleted) return res.status(404).json({ error: 'Photo not found' })
  res.json(deleted)
})

// POST /api/shoots/:id/photos  body: { src } -> adds a finished photo to a session.
// The file itself was uploaded first with POST /api/uploads, which returned this URL.
router.post('/:id/photos', adminOnly, async (req, res) => {
  const src = req.body?.src?.trim()
  if (!src) return res.status(400).json({ error: 'Please upload a photo' })

  const [shoot] = await db.select().from(shoots).where(eq(shoots.id, Number(req.params.id)))
  if (!shoot) return res.status(404).json({ error: 'Session not found' })

  const [photo] = await db.insert(clientPhotos).values({ shootId: shoot.id, src }).returning()
  res.status(201).json(photo)
})

// DELETE /api/shoots/:id -> removes a session (and its photos).
router.delete('/:id', adminOnly, async (req, res) => {
  const [deleted] = await db.delete(shoots).where(eq(shoots.id, Number(req.params.id))).returning()
  if (!deleted) return res.status(404).json({ error: 'Session not found' })
  res.json(deleted)
})

export default router
