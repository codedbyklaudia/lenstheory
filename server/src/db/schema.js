// ============================================================================
// The database schema: every table in our Postgres database, written in JS.
// `npm run db:push` reads this file and creates/updates the real tables in Neon.
//
// JS property names are camelCase (userId); the real column names are snake_case
// (user_id), which is the usual Postgres style.
// ============================================================================

import { boolean, integer, jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

// ---- Auth tables -------------------------------------------------------------
// These four tables are the ones Better Auth needs. Better Auth reads and writes
// them for us during signup, login and logout; we never insert into them ourselves.

// One row per person who has signed up.
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// One row per logged-in browser. The browser keeps `token` in a cookie, and on every
// request Better Auth looks the token up here to find out who is signed in.
// Deleting the row (signing out, or it expiring) logs that browser out.
export const session = pgTable('session', {
  id: text('id').primaryKey(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// HOW a user logs in. For email + password, providerId is 'credential' and `password`
// holds the HASHED password (never the real one). Social logins would add more rows here.
export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Short-lived codes (e.g. email verification, password reset). Unused for now,
// but Better Auth expects the table to exist.
export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ---- Studio tables -----------------------------------------------------------
// Our own data: what used to be hardcoded in client/src/data/studioData.js.

// One row per session type the studio sells (Portraits, Weddings, Family sessions).
export const services = pgTable('services', {
  id: text('id').primaryKey(), // a readable slug like 'portraits'
  name: text('name').notNull(),
  description: text('description').notNull(),
  image: text('image').notNull(),
  alt: text('alt').notNull(),
  bookable: boolean('bookable').notNull(), // false = "enquire only", no fixed price
  enquiryType: text('enquiry_type'),
  pricePerHour: integer('price_per_hour'), // whole pounds; null when not bookable
  features: jsonb('features').notNull(), // list of strings
  terms: jsonb('terms'), // list of { heading, text }, or null
  sortOrder: integer('sort_order').notNull().default(0), // order on the page
})

// One row per photo in the gallery grid.
export const galleryPhotos = pgTable('gallery_photos', {
  id: text('id').primaryKey(),
  src: text('src').notNull(),
  alt: text('alt').notNull(),
  category: text('category').notNull(),
  shape: text('shape').notNull(), // 'tall', 'portrait' or 'square'
  sortOrder: integer('sort_order').notNull().default(0),
})

// One row per message sent through the contact form. Anyone can send one, signed in or not;
// if they were signed in, user_id links it to their account (otherwise it stays null).
export const enquiries = pgTable('enquiries', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  shootType: text('shoot_type').notNull(), // 'Portrait', 'Wedding', 'Family session' or 'Something else'
  preferredDate: text('preferred_date'), // 'YYYY-MM-DD' from the date picker, or null
  timeOfDay: text('time_of_day').notNull(),
  message: text('message').notNull(),
  userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
  status: text('status').notNull().default('new'), // 'new' or 'replied' (set by an admin)
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// One row per booking request a signed-in user sends from their basket.
// Links a user to a service, with how many hours they want.
export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  serviceId: text('service_id')
    .notNull()
    .references(() => services.id),
  hours: integer('hours').notNull(),
  pricePerHour: integer('price_per_hour').notNull(), // price at the time of booking
  status: text('status').notNull().default('requested'), // 'requested', 'confirmed' or 'cancelled'
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
