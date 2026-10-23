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
├── client/                  React frontend (Vite + Tailwind)  -> deployed on Vercel
│   ├── src/
│   │   ├── components/      UI pieces (Header, Gallery, AuthModal, BasketDrawer...)
│   │   ├── data/            text that stays in the frontend (FAQ, nav links, hero slides)
│   │   └── lib/
│   │       ├── api.js       apiFetch() + useApi() hook for calling our API
│   │       └── authClient.js  Better Auth in the browser (sign up / in / out, useSession)
│   ├── vite.config.js       dev proxy: /api -> http://localhost:3000
│   └── vercel.json          production proxy: /api -> the Railway server
│
└── server/                  Express API  -> deployed on Railway
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
to Express (by Vite locally, by Vercel's rewrite in production). Because the browser sees one single
website, the login cookie is a normal first-party cookie and works in every browser.

```
Browser ──> Vercel (React site)
              └── /api/* ──> Railway (Express) ──> Neon (Postgres)
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

**Backend on Railway**
1. New project -> Deploy from GitHub repo -> pick this repo.
2. Service settings -> **Root Directory: `server`**. Railway runs `npm install` and `npm start`.
3. Variables: `DATABASE_URL`, `BETTER_AUTH_SECRET`, and (once the frontend exists) `BETTER_AUTH_URL`
   and `CLIENT_ORIGIN` = your Vercel URL, e.g. `https://lenstheory.vercel.app`.
4. Settings -> Networking -> **Generate Domain**. Check `https://<that-domain>/api/services` shows JSON.

**Frontend on Vercel**
1. Put the Railway domain into `client/vercel.json` (replace `YOUR-RAILWAY-APP.up.railway.app`), commit, push.
2. New project -> import the repo -> **Root Directory: `client`** (framework: Vite).
3. Deploy, then copy the Vercel URL back into Railway's `BETTER_AUTH_URL` and `CLIENT_ORIGIN`.

## Secrets
All secrets live in `server/.env`, which is listed in `.gitignore` and never committed.
`server/.env.example` shows the variable names with placeholder values.
