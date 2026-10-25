import { Router } from 'express'
import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { siteContent } from '../db/schema.js'
import { siteContent as defaultContent } from '../db/seedData.js'
import { adminOnly } from '../middleware/requireAdmin.js'

const router = Router()

// GET /api/content -> { hero: {...}, about: {...}, contact: {...}, ... }
// All the editable text and images of the page. We start from the defaults in seedData.js and lay
// what an admin has saved on top, field by field. So a section nobody has edited shows its default,
// and a field added to the defaults later appears even in sections that were already saved.
router.get('/', async (req, res) => {
  // If the table cannot be read (e.g. `npm run db:push` was not run yet, so it does not exist),
  // log the problem and show the default text, instead of the whole site failing to load.
  const savedRows = await db
    .select()
    .from(siteContent)
    .catch((error) => {
      console.error('Could not read site_content, showing the default text:', error.message)
      return []
    })
  const content = { ...defaultContent }

  for (const row of savedRows) {
    if (content[row.key]) content[row.key] = { ...content[row.key], ...row.value }
  }

  res.json(content)
})

// PUT /api/content/:key  body: the whole section, e.g. { title: '...', subtitle: '...', slides: [...] }
// Admins only. Saves one section, replacing what was saved before.
router.put('/:key', adminOnly, async (req, res) => {
  const defaults = defaultContent[req.params.key]
  if (!defaults) return res.status(404).json({ error: 'Unknown page section' })

  // Keep only the fields the section really has, and check each is the right kind of value
  // (text stays text, a list stays a list), so a bad request cannot break the page.
  const value = {}
  for (const [field, defaultValue] of Object.entries(defaults)) {
    const newValue = req.body?.[field]
    if (newValue === undefined) continue

    const sameKind = Array.isArray(newValue) === Array.isArray(defaultValue) && typeof newValue === typeof defaultValue
    if (!sameKind) return res.status(400).json({ error: `"${field}" has the wrong type` })

    value[field] = newValue
  }

  const updatedAt = new Date()
  await db
    .insert(siteContent)
    .values({ key: req.params.key, value, updatedAt })
    .onConflictDoUpdate({ target: siteContent.key, set: { value, updatedAt } })

  res.json({ ...defaults, ...value })
})

// DELETE /api/content/:key -> forget an admin's changes to one section, so its defaults show again.
router.delete('/:key', adminOnly, async (req, res) => {
  const defaults = defaultContent[req.params.key]
  if (!defaults) return res.status(404).json({ error: 'Unknown page section' })

  await db.delete(siteContent).where(eq(siteContent.key, req.params.key))
  res.json(defaults)
})

export default router
