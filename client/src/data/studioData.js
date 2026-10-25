// ============================================================================
// The few things that stay hardcoded in the frontend.
//
// Everything else now lives on the server and is edited in the admin dashboard (/admin):
//   - gallery photos and services: database tables, fetched from /api/photos and /api/services
//   - the page's text and images (hero, about, FAQ, footer...): fetched from /api/content
//     (defaults in server/src/db/seedData.js, admin changes in the `site_content` table)
// ============================================================================

export const MAX_HOURS = 10

// The menu links point at the sections' ids, so they change together with the code, not the content.
export const navLinks = [
  { label: 'Gallery', href: '#gallery' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Contact', href: '#contact' },
]

// Must match SHOOT_TYPES in server/src/routes/enquiries.js (the server checks every enquiry against it).
export const shootTypes = ['Portrait', 'Wedding', 'Family session', 'Something else']
