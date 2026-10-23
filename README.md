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
│   │   ├── data/            text that stays in the frontend (FAQ, nav links, hero slides)
│   │   └── lib/
│   │       ├── api.js       apiFetch() + useApi() hook for calling our API
│   │       └── authClient.js  Better Auth in the browser (sign up / in / out, useSession)
│   └── vite.config.js       dev proxy: /api -> http://localhost:3000
│
└── server/                  Express API  -> Vercel service `server`
    ├── src/
    │   ├── index.js         creates the Express app and plugs in every route
    │   ├── auth.js          Better Auth config (email + password, 7-day sessions)
    │   ├── middleware/
    │   │   └── requireAuth.js   blocks a route unless the request has a valid session
    │   ├── routes/
    │   │   ├── services.js  GET /api/services
    │   │   ├── photos.js    GET /api/photos
    │   │   ├── bookings.js  GET + POST /api/bookings (signed-in users only)
    │   │   └── enquiries.js POST /api/enquiries (contact form, anyone)
    │   └── db/
    │       ├── schema.js    every table, defined with Drizzle ORM
    │       ├── index.js     the database connection
    │       ├── seedData.js  the old hardcoded services + photos
    │       └── seed.js      copies seedData into the database
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
| `bookings` | a booking request from a signed-in user | which user, which service, hours, price at the time |
| `enquiries` | a message sent through the contact form | name, email, shoot type, preferred date, message, user (if signed in) |

Relationships: a user has many sessions, accounts and bookings (`user_id` foreign keys; deleting a
user deletes them too). Each booking points to one service (`service_id`). An enquiry *may* point to
a user: guests can send one too, so `user_id` is optional (and set to null if that user is deleted).
The first four tables are managed by Better Auth; the last four are ours.

## Running it locally

You need Node 20+ and a Postgres database (a free [Neon](https://neon.tech) project is fine).

```bash
# 1. Server
cd server
npm install
cp .env.example .env      # then fill in DATABASE_URL and BETTER_AUTH_SECRET
npm run db:push           # creates the tables in your database
npm run db:seed           # fills services + gallery_photos
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
3. Deploy. Check `https://<your-domain>/api/services` shows JSON, then sign up on the live site.

Vercel's own domains (production, preview and the deployment URL) are trusted for login automatically
(see `vercelOrigins()` in `server/src/auth.js`).

## Secrets
All secrets live in `server/.env`, which is listed in `.gitignore` and never committed.
`server/.env.example` shows the variable names with placeholder values.
