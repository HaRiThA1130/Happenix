# Next.js + MongoDB Mini Assignment

Summary
- A minimal Next.js (App Router) app that imports user/customer data from a public API and stores it in MongoDB, then displays the stored customers.

Data flow
- Import endpoint (`/api/import`): fetches users from `https://jsonplaceholder.typicode.com/users`, upserts them into the `customers` collection (duplicates handled by `email`).
- Customers API (`/api/customers`): returns documents from the `customers` collection.
- UI (`/`): server-rendered page that reads customers from MongoDB and shows them; a client button triggers the import endpoint.

Decisions
- App Router used (files under `app/`).
- Simple duplicate handling: use `email` as a unique key and `upsert` to avoid duplicate inserts.
- The UI queries the database (server-side) so displayed data always comes from MongoDB.

Run locally
1. Copy `.env.local.sample` to `.env.local` and set `MONGODB_URI` (MongoDB Atlas connection string) and optionally `MONGODB_DB`.
2. Install and run:

```bash
npm install
npm run dev
```

3. Open `http://localhost:3000`.
4. Click `Import Customers` to fetch from the public API and store into MongoDB. The page will refresh to show stored customers.

Notes
- To submit, push this folder to a GitHub repository and share the link.
