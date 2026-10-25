# LensTheory
A small photography studio site: a portfolio gallery, priced sessions you can add to a basket, and a
booking request system, built with React + Tailwind on the front and Node.js + Express + Postgres on the back.

## Status
- Week 1 - Static HTML/CSS landing page (kept in `legacy/`).
- Week 2 - React + Tailwind (Vite), content from hardcoded arrays.
- Week 3 - Real backend: Express API, Neon Postgres database, Better Auth login, deployed.

## Folder structure

```
LensTheory/
├── vercel.json              one Vercel project, two services: /api/* -> server, the rest -> client
├── client/                  React frontend (Vite + Tailwind)  -> Vercel service `client`
│   ├── src/
│   │   ├── components/      UI pieces (Header, Gallery, AuthModal, BasketDrawer...)
│   │   │   └── admin/       the dashboard's editors: FieldInput, ContentEditor, RecordsEditor, EnquiryReply
│   │   ├── data/
│   │   │   ├── studioData.js   the little that stays hardcoded (nav links, shoot types)
│   │   │   └── adminFields.js  which fields the dashboard lets admins edit, described as data
│   │   └── lib/
│   │       ├── api.js       apiFetch() + useApi() hook for calling our API
│   │       ├── authClient.js  Better Auth in the browser (sign up / in / out, useSession)
│   │       └── uploadImage.js shrinks a photo in the browser, then uploads it
│   └── vite.config.js       dev proxy: /api -> http://localhost:3000
│
└── server/                  Express API  -> Vercel service `server`
    ├── src/
    │   ├── index.js         creates the Express app and plugs in every route
    │   ├── auth.js          Better Auth config (email + password, 7-day sessions)
    │   ├── email.js         sendEmail() through Resend, for replying to enquiries
    │   ├── middleware/
    │   │   ├── requireAuth.js   blocks a route unless the request has a valid session
    │   │   └── requireAdmin.js  blocks a route unless that user's email is in ADMIN_EMAILS
    │   │                        (+ `adminOnly` = both checks, for single routes)
    │   ├── routes/
    │   │   ├── content.js   GET /api/content (anyone), PUT/DELETE a section (admins)
    │   │   ├── services.js  GET /api/services (anyone), add/edit/delete/reorder (admins)
    │   │   ├── photos.js    GET /api/photos (anyone), add/edit/delete/reorder (admins)
    │   │   ├── uploads.js   POST /api/uploads: image -> Vercel Blob -> public URL (admins)
    │   │   ├── bookings.js  GET + POST /api/bookings (signed-in users only)
    │   │   ├── enquiries.js POST /api/enquiries (contact form, anyone)
    │   │   └── admin.js     /api/admin/* dashboard data, status changes, email replies (admins only)
    │   └── db/
    │       ├── schema.js    every table, defined with Drizzle ORM
    │       ├── index.js     the database connection
    │       ├── seedData.js  starting services + photos, and the default page text
    │       └── seed.js      copies the services + photos into the database
    ├── drizzle.config.js    settings for `npm run db:push`
    └── .env.example         which secrets the server needs (the real .env is git-ignored)
```

## How a request travels

The browser only ever talks to the frontend's address. Anything starting with `/api` is forwarded
to Express (by Vite's proxy locally, by the rewrites in the root `vercel.json` in production). Because the browser sees one single
website, the login cookie is a normal first-party cookie and works in every browser.

```
Browser ──> one Vercel domain
              ├── /api/*  ──> service `server` (Express) ──> Neon (Postgres)
              └── /*      ──> service `client` (React site)
```

## The database in plain English

| Table | One row is... | Key columns |
| --- | --- | --- |
| `user` | a person who signed up | name, email (unique) |
| `account` | how that person logs in | provider (`credential` = email + password), the **hashed** password |
| `session` | one signed-in browser | token (stored in the cookie), expiry date, which user |
| `verification` | a short-lived code (reserved for email verification / password reset) | |
| `services` | a session type the studio sells | name, price per hour, bookable?, features, terms |
| `gallery_photos` | a photo in the gallery | image path, alt text, category, shape |
| `bookings` | a booking request from a signed-in user | which user, which service, hours, price at the time, status (requested / confirmed / cancelled) |
| `enquiries` | a message sent through the contact form | name, email, shoot type, preferred date, message, user (if signed in), status (new / replied) |
| `enquiry_replies` | an email an admin sent back from the dashboard | which enquiry, the message, which admin sent it |
| `site_content` | one section of the page an admin has edited | key (`hero`, `about`...), value (that section's fields as JSON) |

Relationships: a user has many sessions, accounts and bookings (`user_id` foreign keys; deleting a
user deletes them too). Each booking points to one service (`service_id`). An enquiry *may* point to
a user: guests can send one too, so `user_id` is optional (and set to null if that user is deleted).
An enquiry has many replies (`enquiry_id`; deleting the enquiry deletes them).
The first four tables are managed by Better Auth; the rest are ours.

## Admin dashboard

`/admin` shows the studio's dashboard. The first three tabs are about customers, the last three edit
the public site, so the studio can change it without touching code:

| Tab | What admins can do |
| --- | --- |
| Enquiries | read every message, **reply by email** (the server sends it through Resend and saves a copy), mark as replied |
| Bookings | confirm or cancel booking requests |
| Users | see who signed up and how many bookings each made |
| Page content | edit every section's text and photos: hero slideshow, word bands, about, booking steps, contact details, FAQ, footer |
| Gallery | add, edit, delete and reorder gallery photos |
| Services | add, edit, delete and reorder services (prices, features, terms) |

**How editable page text works.** The default text for every section is in `server/src/db/seedData.js`
(`siteContent`). When an admin saves a section, it is stored as one row in `site_content`.
`GET /api/content` returns the defaults with the saved rows laid on top, and `App.jsx` passes each
section's part down to its component as a `content` prop. "Reset to original" deletes the row.

**How the editors are built.** `client/src/data/adminFields.js` describes each form as data
(`{ name: 'subtitle', label: 'Subtitle', type: 'textarea' }`). `FieldInput` draws the right input for a
`type`, so the Page content, Gallery and Services forms are all made of the same parts.

**Uploading photos.** On Vercel the server's disk is wiped between requests, so uploaded files are stored in
Vercel Blob instead and only their URL goes in the database. The browser first shrinks the photo
(`lib/uploadImage.js`), because Vercel only accepts requests up to about 4.5 MB. Admins can also paste the
address of an image that is already online, or of one in `client/public/images` (e.g. `/images/pet.webp`).

Who is an admin is decided **on the server**, by the `ADMIN_EMAILS` variable (comma-separated emails).
Every `/api/admin/*` route runs `requireAuth` then `requireAdmin`, so a non-admin gets `403 Admins only`
even if they type the address in by hand. The "Admin dashboard" link in the account menu is only a
shortcut: it appears when `GET /api/admin/check` says the signed-in user is an admin.

## Running it locally

You need Node 20+ and a Postgres database (a free [Neon](https://neon.tech) project is fine).

```bash
# 1. Server
cd server
npm install
cp .env.example .env      # then fill in DATABASE_URL and BETTER_AUTH_SECRET
npm run db:push           # creates the tables in your database
npm run db:seed           # fills services + gallery_photos (never overwrites admin changes)
npm run dev               # API on http://localhost:3000

# 2. Client (in a second terminal)
cd client
npm install
npm run dev               # site on http://localhost:5173
```

## Deploying

The whole app deploys as **one Vercel project** with two services, defined in the root `vercel.json`:

| Service | Folder | What it is | Public path |
| --- | --- | --- | --- |
| `client` | `client/` | React site (Vite) | everything else (`/`) |
| `server` | `server/` | Express API | `/api/*` |

Both live on the same domain, so the login cookie is a normal first-party cookie. Express receives the
full path (`/api/services`), which matches its routes.

1. vercel.com -> **Add New Project** -> import this repo. Leave the root directory as the repo root
   (Vercel reads `vercel.json` and builds both services).
2. Project -> Settings -> **Environment Variables**:
   - `DATABASE_URL`: the Neon connection string
   - `BETTER_AUTH_SECRET`: a long random string
   - `BETTER_AUTH_URL`: the production URL, e.g. `https://lenstheory.vercel.app`
   - `ADMIN_EMAILS`: the email(s) allowed into `/admin`
   - `RESEND_API_KEY` and `EMAIL_FROM`: for replying to enquiries (see `server/.env.example`)
   - Storage tab -> create a **Blob** store and connect it: this adds `BLOB_READ_WRITE_TOKEN` (photo uploads)
3. Deploy. Check `https://<your-domain>/api/services` shows JSON, then sign up on the live site.

Vercel's own domains (production, preview and the deployment URL) are trusted for login automatically
(see `vercelOrigins()` in `server/src/auth.js`).

## Secrets
All secrets live in `server/.env`, which is listed in `.gitignore` and never committed.
`server/.env.example` shows the variable names with placeholder values.
