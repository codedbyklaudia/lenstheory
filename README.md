# LensTheory
A small photography studio site: a portfolio gallery, priced sessions you can add to a basket, and a
booking request system, built with React + Tailwind on the front and Node.js + Express + Postgres on the back.

## Status
- Week 1 - Static HTML/CSS landing page (kept in `legacy/`).
- Week 2 - React + Tailwind (Vite), content from hardcoded arrays.
- Week 3 - Real backend: Express API, Neon Postgres database, Better Auth login, deployed.
- Week 4 - Payments: Stripe Checkout (test mode), orders, webhook, success page.

## Folder structure

```
LensTheory/
├── vercel.json              one Vercel project, two services: /api/* -> server, the rest -> client
├── client/                  React frontend (Vite + Tailwind)  -> Vercel service `client`
│   ├── src/
│   │   ├── components/      UI pieces (Header, Gallery, AuthModal, BasketDrawer...)
│   │   │   ├── account/     the account page tabs: MySessions (tickets), MyGallery (polaroids), MyOrders (receipts), MyDetails (press pass)
│   │   │   └── admin/       the dashboard's editors: FieldInput, ContentEditor, RecordsEditor, ShootsEditor, EnquiryReply
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
    │   ├── stripe.js        the Stripe client (uses STRIPE_SECRET_KEY)
    │   ├── basket.js        priceBasket(): checks a basket and looks up REAL prices in the database
    │   ├── middleware/
    │   │   ├── requireAuth.js   blocks a route unless the request has a valid session
    │   │   └── requireAdmin.js  blocks a route unless that user's email is in ADMIN_EMAILS
    │   │                        (+ `adminOnly` = both checks, for single routes)
    │   ├── routes/
    │   │   ├── content.js   GET /api/content (anyone), PUT/DELETE a section (admins)
    │   │   ├── services.js  GET /api/services (anyone), add/edit/delete/reorder (admins)
    │   │   ├── photos.js    GET /api/photos (anyone), add/edit/delete/reorder (admins)
    │   │   ├── uploads.js   POST /api/uploads: image -> Vercel Blob -> public URL (admins)
    │   │   ├── checkout.js  POST /api/checkout: pending order + Stripe payment page (signed in)
    │   │   ├── stripe.js    POST /api/stripe/webhook: Stripe says "paid" -> order marked paid
    │   │   ├── orders.js    GET /api/orders, /api/orders/:id: my own orders (signed in)
    │   │   ├── shoots.js    GET /api/shoots: my sessions + delivered photos; admins plan + deliver them
    │   │   ├── bookings.js  GET + POST /api/bookings (older booking requests, signed in)
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
| `orders` | one purchase | which user, status (pending / paid / expired), total, Stripe session id, paid at |
| `order_items` | one line of an order | which order, which service, its name and hourly price **at the time**, hours |
| `shoots` | one photo session a customer has | which user, which order (if paid online), session name, status (unscheduled / scheduled / delivered), date, location, note |
| `client_photos` | one finished photo delivered for a shoot | which shoot, image URL |
| `enquiry_replies` | an email an admin sent back from the dashboard | which enquiry, the message, which admin sent it |
| `site_content` | one section of the page an admin has edited | key (`hero`, `about`...), value (that section's fields as JSON) |

Relationships: a user has many sessions, accounts and bookings (`user_id` foreign keys; deleting a
user deletes them too). Each booking points to one service (`service_id`). An enquiry *may* point to
a user: guests can send one too, so `user_id` is optional (and set to null if that user is deleted).
A user has many orders, and an order has many order items (`order_id`); each item points to a
service (`service_id`). An enquiry has many replies (`enquiry_id`; deleting the enquiry deletes them).
The first four tables are managed by Better Auth; the rest are ours.

## Customer account

Every signed-in user has their own page at `/account`. The account menu (the name in the header)
links to every tab directly (`/account?tab=sessions`), and for admins it also lists every dashboard
tab under **Studio** (`/admin?tab=orders`).

| Tab | What it does | How |
| --- | --- | --- |
| My sessions | each photo session: to be scheduled, booked (date, place, a note from the studio) or delivered | `GET /api/shoots`, only this user's rows |
| My gallery | the finished photos, grouped by session, with a full-screen viewer and download | same request; the server only includes photos of sessions marked **delivered** |
| My orders | every order, its sessions, total and status (paid / not paid / expired), with a receipt link | `GET /api/orders`: `requireAuth`, and only rows `WHERE user_id = the signed-in user` |
| My details | change your name, change your password | Better Auth's built-in `authClient.updateUser()` and `authClient.changePassword()` (checks the current password, saves the new one hashed, signs out other devices) |

The email address is shown but not editable, because it is what you sign in with.

**Where sessions come from.** When the Stripe webhook marks an order paid, it creates one `shoots` row
per order line (status `unscheduled`). It only does this when the order *changes* to paid, so if Stripe
sends the same event twice, no duplicates are made. Admins can also add a session by hand (e.g. for a
wedding agreed by email). In the dashboard's **Sessions** tab the studio sets the date and place
(→ `scheduled`), uploads the finished photos, and sets `delivered`, which shows them in the customer's
gallery. Both changes email the customer, if email is set up.

## Admin dashboard

`/admin` shows the studio's dashboard. The first three tabs are about customers, the last three edit
the public site, so the studio can change it without touching code:

| Tab | What admins can do |
| --- | --- |
| Enquiries | read every message, **reply by email** (the server sends it through Resend and saves a copy), mark as replied |
| Orders | every Stripe order, its lines, and its status (set by the webhook) |
| Sessions | schedule each client's shoot, upload their finished photos, deliver them to their gallery |
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

## Payments (Stripe, test mode)

The basket's **Pay now** button takes a signed-in customer through Stripe Checkout:

```
Basket "Pay now"
  └─> POST /api/checkout          (requireAuth: must be signed in)
        1. priceBasket(): real prices from the services table (prices from the browser are ignored)
        2. INSERT orders (status 'pending') + order_items
        3. Stripe: create a Checkout Session, with metadata.orderId
        4. answer { url } ──> browser goes to Stripe's hosted payment page
Customer pays with the test card 4242 4242 4242 4242
  ├─> Stripe ──> POST /api/stripe/webhook   (signature checked with STRIPE_WEBHOOK_SECRET)
  │                 UPDATE orders SET status = 'paid'   <- the ONLY place an order becomes paid
  └─> Stripe redirects the customer to /order/success?order=12
        the page asks GET /api/orders/12 every 2 s until the status is no longer 'pending'
```

Why the webhook and not the success page? Anyone can open `/order/success?order=12` without paying,
but only Stripe can sign a webhook request, so only the webhook is trusted to say "paid".
The webhook route reads the **raw** request body (the signature is made from the exact bytes), which is
why `index.js` plugs it in before `express.json()`.

**Test it locally** (needs the [Stripe CLI](https://docs.stripe.com/stripe-cli): `brew install stripe/stripe-cli/stripe`, then `stripe login`):

```bash
cd server
npm run stripe:listen     # forwards Stripe's webhooks to localhost:3000 and prints a whsec_... secret
# put that whsec_... in server/.env as STRIPE_WEBHOOK_SECRET, restart `npm run dev`, then pay on the site
```

Admins see every order and its status in the dashboard's **Orders** tab.

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
   - `STRIPE_SECRET_KEY`: Stripe (Test mode) -> Developers -> API keys -> secret key `sk_test_...`
   - `STRIPE_WEBHOOK_SECRET`: Stripe -> Developers -> Webhooks -> add endpoint
     `https://<your-domain>/api/stripe/webhook` with events `checkout.session.completed` and
     `checkout.session.expired`, then copy its signing secret (a different `whsec_...` from the CLI's)
   - `RESEND_API_KEY` and `EMAIL_FROM`: for replying to enquiries (see `server/.env.example`)
   - Storage tab -> create a **Blob** store and connect it: this adds `BLOB_READ_WRITE_TOKEN` (photo uploads)
3. Deploy. Check `https://<your-domain>/api/services` shows JSON, then sign up on the live site.

Vercel's own domains (production, preview and the deployment URL) are trusted for login automatically
(see `vercelOrigins()` in `server/src/auth.js`).

## Secrets
All secrets live in `server/.env`, which is listed in `.gitignore` and never committed.
`server/.env.example` shows the variable names with placeholder values.
