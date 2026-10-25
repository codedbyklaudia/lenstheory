// Turns a basket sent by the browser into lines with REAL prices from the database.
// Used by checkout (and by the older booking requests), so both check a basket the same way.
//
//   const { error, lines } = await priceBasket([{ serviceId: 'portraits', hours: 2 }])
//   lines -> [{ service: {...row from the services table}, hours: 2 }]
//
// The browser only tells us WHAT it wants and for how long. The price always comes from our
// database, so nobody can pay less by editing the request in their browser's dev tools.

import { db } from './db/index.js'
import { services } from './db/schema.js'

export const MAX_HOURS = 10

export async function priceBasket(items) {
  if (!Array.isArray(items) || items.length === 0) return { error: 'Your basket is empty' }

  const allServices = await db.select().from(services)
  const lines = []

  for (const item of items) {
    const service = allServices.find((s) => s.id === item.serviceId)
    const hours = Number(item.hours)

    if (!service || !service.bookable) return { error: `"${item.serviceId}" cannot be booked online` }
    if (!Number.isInteger(hours) || hours < 1 || hours > MAX_HOURS) {
      return { error: `Hours must be between 1 and ${MAX_HOURS}` }
    }

    lines.push({ service, hours })
  }

  return { lines }
}
