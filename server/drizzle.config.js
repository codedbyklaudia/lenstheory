// Settings for drizzle-kit, the command-line tool behind `npm run db:push`.
// It compares src/db/schema.js with the real database and creates/changes tables to match.

import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.js',
  dbCredentials: { url: process.env.DATABASE_URL },
})
