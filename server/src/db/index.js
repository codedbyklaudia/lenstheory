// The one database connection the whole server shares.
// A "pool" keeps a few connections open and reuses them, instead of opening a new one per request.

import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import * as schema from './schema.js'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing. Copy server/.env.example to server/.env and fill it in.')
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

export const db = drizzle(pool, { schema })
