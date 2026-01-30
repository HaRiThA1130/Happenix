# Happenix – Full Project Overview (Beginner-Friendly)

This document explains the **Happenix** project from start to end: how it works, where the frontend and backend live, and how each part fits together. Use it to prepare for explaining the project in an interview.

---

## 1. What the App Does (High Level)

**Happenix** is a small full-stack web app that:

1. **Shows a list of customers** in a table on the home page.
2. **Imports sample customers** from an external API (JSONPlaceholder) and saves them into **MongoDB**.
3. **Avoids duplicates** when importing: if a customer with the same email already exists, they are skipped.
4. **Gives clear feedback**: “X customers imported” or “Already synced” when you click Import.

So in one sentence: *It’s a Next.js app that displays customers from MongoDB and lets you sync sample data from an API without creating duplicates.*

---

## 2. Project Structure – Where Things Live

```
Happenix/
├── app/                    ← Frontend + API (Next.js App Router)
│   ├── page.js             ← Main page (customers list) – FRONTEND
│   ├── layout.js           ← Root layout (fonts, metadata) – FRONTEND
│   ├── globals.css         ← Global styles – FRONTEND
│   ├── components/        ← React components – FRONTEND
│   │   └── ImportButton.jsx
│   └── api/                ← Backend API routes – BACKEND
│       ├── customers/
│       │   └── route.js     ← GET /api/customers
│       └── import/
│           └── route.js   ← POST /api/import
├── lib/
│   └── mongodb.js          ← MongoDB connection – BACKEND (shared)
├── .env.local              ← Secrets (MongoDB URI) – not in git
├── package.json            ← Dependencies and npm scripts
└── next.config.js          ← Next.js config
```

- **Frontend**: What the user sees and interacts with.  
  Lives in: `app/page.js`, `app/layout.js`, `app/globals.css`, `app/components/`.
- **Backend**: Logic that runs on the server (API, database).  
  Lives in: `app/api/customers/route.js` and `lib/mongodb.js`.

In Next.js, **frontend and backend are in the same repo**. The “backend” is the `app/api/` folder and the shared `lib/mongodb.js` used by those API routes and by the server-rendered page.

---

## 3. npm and package.json

**What is npm?**  
npm is the package manager for Node.js. It installs and manages the libraries your app depends on.

- **`package.json`** lists:
  - **Dependencies**: e.g. `next`, `react`, `mongodb`.
  - **Scripts**: e.g. `npm run dev`, `npm run build`, `npm start`.

**Important scripts:**

| Command        | What it does                          |
|----------------|----------------------------------------|
| `npm install`  | Installs all dependencies (once)       |
| `npm run dev`  | Starts the app in development mode     |
| `npm run build`| Builds for production                  |
| `npm start`    | Runs the production build              |

**Why run `npm install` in this folder?**  
Each project has its own `package.json` and its own `node_modules`. Other projects (e.g. in other folders) have their own dependencies. So you must run `npm install` in the Happenix folder to get Next.js, React, MongoDB driver, etc. for this app.

**package-lock.json**  
- Records the **exact** versions that were installed.  
- Ensures everyone gets the same dependency tree when they run `npm install`.  
- You don’t edit it by hand; npm updates it.

---

## 4. How a Request Flows – From Start to End

### When the user opens the home page (`/`)

1. **Browser** requests the home page.
2. **Next.js** runs `app/page.js` **on the server** (it’s a Server Component).
3. `page.js` calls `getDB()` from `lib/mongodb.js` → gets a connection to MongoDB.
4. It reads from the `customers` collection: `find()`, sort by name, no `raw` field.
5. Next.js **renders** the HTML (header, empty state or table, Import button).
6. The **HTML + CSS + minimal JS** is sent to the browser.
7. The **Import button** is a Client Component (`'use client'`), so it becomes interactive in the browser.

### When the user clicks “Import Customers”

1. **Browser** runs the `ImportButton` logic (client-side).
2. It sends a **POST** request to `/api/import`.
3. **Backend** `app/api/import/route.js` runs **on the server**:
   - Fetches users from `https://jsonplaceholder.typicode.com/users`.
   - For each user, checks MongoDB by **email** (see “Duplication” below).
   - Returns JSON: `{ imported, skipped, total }`.
4. **Browser** gets the response:
   - If `imported > 0`: shows “X customers imported!” and reloads the page (so the new data appears).
   - If `imported === 0`: shows “Already synced. No new customers to import.” (no reload).

So: **frontend** = page + button + styles; **backend** = API routes + MongoDB. Both are in the same Next.js app.

---

## 5. route.js – What It Is and How It Works

In Next.js **App Router**, a file named **`route.js`** (or `route.ts`) inside a folder defines an **API route**. The folder path is the URL path.

| File path                    | URL              | Meaning                    |
|-----------------------------|------------------|----------------------------|
| `app/api/customers/route.js`| `/api/customers` | API for customers          |
| `app/api/import/route.js`   | `/api/import`    | API for import action      |

**What’s inside a route.js?**

- **Named exports** for HTTP methods: `GET`, `POST`, `PUT`, `DELETE`, etc.
- Each export is an **async function** that receives the request and returns a **Response** (often using `NextResponse.json()`).

**Example – `app/api/customers/route.js`:**

- Exports **`GET`**.
- When someone does `GET /api/customers`, Next.js runs this function.
- It uses `getDB()` → `db.collection('customers')` → `find()`, sort, project out `raw` → `toArray()`.
- Returns `NextResponse.json(docs)` so the client gets JSON.

**Example – `app/api/import/route.js`:**

- Exports **`POST`** (and optionally `GET` for a simple message).
- When someone does `POST /api/import`, Next.js runs the `POST` function.
- It fetches from JSONPlaceholder, then for each user runs an `updateOne` with `upsert: true` and `$setOnInsert` (see “Duplication” below).
- Returns `NextResponse.json({ imported, skipped, total })`.

So: **route.js = backend endpoint**. One file per route; the file path = the API path.

---

## 6. MongoDB – Connection and Data Model (Schema)

### Connection – `lib/mongodb.js`

- Reads **`MONGODB_URI`** from `process.env` (set in `.env.local`).
- Creates a **single shared** `MongoClient` and reuses it (in dev, stored on `global` so Hot Reload doesn’t open many connections).
- Exports **`getDB()`**: returns a Promise of the database (default name from `MONGODB_DB` or `'happenix'`).

So every API route and the server-rendered page that need the DB call `getDB()`, then do `db.collection('customers')`.

### Data model (what we store) – “Schema”

MongoDB is **schemaless**: you don’t define a schema in code like in SQL. The “schema” here is the **shape of the documents** we choose to write.

**Collection:** `customers`

**Document shape we use:**

| Field      | Type   | Description                          |
|-----------|--------|--------------------------------------|
| `_id`     | ObjectId | Auto-generated by MongoDB           |
| `name`    | string | Customer name                        |
| `email`   | string | Email (we use this for duplicate check) |
| `phone`   | string | Phone number                         |
| `sourceId`| number | ID from JSONPlaceholder (optional)   |
| `raw`     | object | Full API response (optional, not shown in UI) |

In the UI we **hide** `raw` via `projection: { raw: 0 }` so we don’t send that large field to the client.

So when we say “MongoDB data model” or “schema” in this project, we mean: **one collection, `customers`, with documents that have at least `name`, `email`, `phone`, and we use `email` as the unique key for avoiding duplicates.**

---

## 7. Duplication – How We Avoid It

**Goal:** When we import from the API again, we must **not** insert the same person twice. We treat **email** as the unique identifier.

**How we do it:**

- We use **`updateOne`** with:
  - **Filter:** `{ email: doc.email }`
  - **Update:** `{ $setOnInsert: doc }`
  - **Option:** `{ upsert: true }`

**Meaning:**

- If a document with that **email** already exists → **nothing** is inserted; `$setOnInsert` does nothing. We count this as “skipped.”
- If **no** document with that email exists → MongoDB **inserts** the new document (upsert). We count this as “inserted.”

So we don’t check “is duplicate?” in a separate step; we use **upsert + $setOnInsert** so that only *new* emails create new documents. That’s how we handle “duplication” in this app.

---

## 8. UI / Animation – Row Hover and Blur (Focus Effect)

**What we built:**  
When you **hover over a table row for about 1.25 seconds**, that row **lifts up** slightly and gets a shadow, and **all other rows are blurred**. So only the hovered record is sharp; the rest are de-emphasized for better concentration.

**Why the delay (1.25s)?**  
So the effect doesn’t trigger on quick mouse moves. It only activates when the user intentionally focuses on one record for a moment.

**How it’s done (conceptually):**

- **CSS** only (no extra JS).
- When the table body **has** a hovered row (`:has(tr:hover)`):
  - All rows get a **blur** and a short transition delay (1.25s) before the blur is applied.
  - The **hovered** row gets **no blur**, a **translateY** (lift), a **box-shadow**, and the same 1.25s delay so the “focus” state (lift + blur others) appears together after ~1.25s.

**Accessibility:**  
This is wrapped in `@media (prefers-reduced-motion: no-preference)` so users who prefer reduced motion don’t get the effect.

In the interview you can say: *“We added a focus effect: when you hover on a row for about 1.25 seconds, that row lifts and the rest of the table blurs so you can concentrate on that one record. It’s implemented in CSS with a delay so it doesn’t fire on accidental hovers.”*

---

## 9. Making This Work in the Real World

Right now the app uses a **public demo API** (JSONPlaceholder) and a single MongoDB collection. Here's how you'd adapt it for **real-world use**:

### Environment and configuration

- **Production env vars**: Use a real `.env` or platform env (Vercel, Railway, etc.) for `MONGODB_URI` and `MONGODB_DB`. Never commit secrets; use `.env.local.sample` as a template only.
- **Different environments**: Use different MongoDB databases or clusters for dev vs prod (e.g. `MONGODB_DB=happenix_dev` vs `happenix_prod`) so test data doesn't mix with real data.

### Security

- **Auth**: Add authentication (e.g. NextAuth, Clerk) so only logged-in users can view or import customers. Protect `/api/import` and `/api/customers` by checking the session or API key.
- **API protection**: Rate-limit `/api/import` (e.g. per user or per IP) so it can't be spammed. Validate and sanitize any input if you add forms or query params.
- **Secrets**: Keep `MONGODB_URI` and any API keys in env only; ensure `.env.local` is in `.gitignore` (it already is).

### Real data sources

- **Replace JSONPlaceholder**: Point the import logic at your real source (CRM API, CSV upload, partner API). Keep the same pattern: fetch → normalize (name, email, phone) → upsert by email.
- **Idempotency**: The current "upsert by email" approach is already idempotent: re-running import doesn't create duplicates. For other APIs, you might add idempotency keys or source IDs to avoid double-processing.

### Reliability and operations

- **Error handling**: Return clear error messages and status codes from API routes (e.g. 400 for bad input, 502 when the external API fails). Log errors (e.g. to a service) for debugging.
- **Health check**: Add a simple health route (e.g. `GET /api/health` that pings MongoDB) so load balancers or platforms can check if the app is up.
- **Deployment**: Build with `npm run build`, run with `npm start`. Deploy to Vercel, Railway, or any Node host; set env vars in the platform's dashboard.

In short: **real world** = proper env/config, auth and rate limiting, real data source instead of JSONPlaceholder, and basic error handling and deployment.

---

## 10. Making This Scalable

As traffic and data grow, you can scale both **the app** and **the database** without changing the core design much.

### Database scalability

- **Indexes**: Create an index on `email` (and optionally `name`) so find/update by email stays fast as the collection grows:
  ```js
  await col.createIndex({ email: 1 }, { unique: true });
  ```
  Unique index on `email` also enforces no duplicate emails at the DB level.
- **Pagination**: Don't load all customers at once. Use `skip` + `limit` or cursor-based pagination (e.g. `find().sort({ _id: 1 }).limit(20)` and pass last `_id` for "next page"). Expose this via query params (e.g. `?page=1&limit=20`) in `/api/customers` and the page.
- **Projection**: We already exclude `raw` in the UI; keep only the fields you need in API responses to reduce payload size and memory.

### API and app scalability

- **Connection pooling**: The MongoDB driver (and our `lib/mongodb.js`) already reuse a single client; that's connection pooling. In production, many serverless invocations share this pattern so you don't open a new connection per request.
- **Caching**: For read-heavy traffic, cache the customer list (e.g. in-memory, Redis, or Next.js `revalidate`) for a short TTL and invalidate when data changes (e.g. after import). Use `GET /api/customers` with cache headers or a caching layer.
- **Rate limiting**: Limit how often `/api/import` can be called (per user or IP) so one client can't overload the external API or your DB.
- **Async import**: For very large imports, accept the request, return "Import started," and process in a background job or queue (e.g. worker, queue like Bull/BullMQ). The UI can poll or use WebSockets for status.

### Frontend and delivery

- **Server components**: The main page is already a Server Component that reads from MongoDB; that keeps the server doing the heavy read and sends only HTML/data to the client. Good for scaling reads.
- **CDN**: Deploy the app behind a CDN (e.g. Vercel's edge) so static assets and cached pages are served from the edge and reduce load on the origin.
- **Horizontal scaling**: Run multiple instances of the app (e.g. several `npm start` behind a load balancer). They all talk to the same MongoDB; the driver handles concurrent connections.

### Summary

| Area            | What to do for scale |
|-----------------|----------------------|
| **Database**    | Index on `email`, paginate results, keep projections small. |
| **API**         | Reuse DB client (already done), add caching and rate limiting; move big imports to background jobs if needed. |
| **App**         | Keep server-side data fetching, deploy behind CDN, run multiple instances if needed. |

So: **real world** = production env, auth, real data source, and solid error handling; **scalable** = indexes, pagination, caching, rate limiting, and optional async processing for large imports.

---

## 11. Quick Recap for the Interview

| Topic            | Short answer |
|-----------------|--------------|
| **What is the app?** | A Next.js app that shows customers from MongoDB and lets you import sample data from an API without duplicates. |
| **Frontend vs backend?** | Frontend: `app/page.js`, layout, components, CSS. Backend: `app/api/*/route.js` and `lib/mongodb.js`. Same repo. |
| **What is route.js?** | File that defines an API endpoint; folder path = URL (e.g. `api/import/route.js` → `/api/import`). Exports `GET`, `POST`, etc. |
| **MongoDB “schema”?** | One collection `customers`; documents have `name`, `email`, `phone`, optional `sourceId` and `raw`. We use `email` as the unique key. |
| **Duplication?** | We use `updateOne` with `{ email }`, `$setOnInsert`, and `upsert: true` so only new emails insert; existing emails are skipped. |
| **npm?** | Package manager; `package.json` = dependencies and scripts; `npm install` in this folder installs deps for this project only. |
| **Animation?** | Row hover for ~1.25s → that row lifts, others blur for better focus; done in CSS with `prefers-reduced-motion` respected. |
| **Real world?** | Production env, auth + rate limiting, real data source (not JSONPlaceholder), error handling, health check, deploy to Vercel/Railway. |
| **Scalable?** | Index on `email`, pagination, caching, rate limiting; optional async import (queue) for large jobs; CDN + multiple app instances. |

You can use this doc as a single place to explain the full working and workflow of Happenix from a beginner perspective, and to talk about duplication, npm, frontend/backend, route.js, the MongoDB data model, real-world use, and scalability in the interview.

---

## Run locally

1. Copy `.env.local.sample` to `.env.local` and set `MONGODB_URI` (MongoDB Atlas connection string) and optionally `MONGODB_DB`.
2. Install and run:

```bash
npm install
npm run dev
```

3. Open `http://localhost:3000`.
4. Click `Import Customers` to fetch from the public API and store into MongoDB. The page will refresh to show stored customers.
