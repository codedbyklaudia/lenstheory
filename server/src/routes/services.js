import { Router } from 'express'
import { asc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { services } from '../db/schema.js'

const router = Router()

// GET /api/services -> every service, in page order, as JSON.
// SQL equivalent: SELECT * FROM services ORDER BY sort_order;
router.get('/', async (req, res) => {
  const rows = await db.select().from(services).orderBy(asc(services.sortOrder))
  res.json(rows)
})

export default router
