# saleTAG-r

This repo is a Next.js (App Router) TypeScript project using Tailwind CSS, Prisma, PostgreSQL, and Stripe.

## Quick start

1. Install dependencies:

```powershell
npm install
```

2. Copy `.env.example` to `.env` and set values. `DATABASE_URL` must point to PostgreSQL. The former local SQLite database is not used by the Vercel deployment.

3. Create or update the development database schema:

```powershell
npm run prisma:migrate
```

Prisma Client is generated automatically during dependency installation.

4. Run the development server:

```powershell
npm run dev
# open http://localhost:3000
```

## Vercel setup

Configure `DATABASE_URL`, `NEXT_PUBLIC_BASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD` in the Vercel project environment settings. Use a strong, unique admin password. Set `STRIPE_SUBSCRIPTION_PRICE_ID` if you have created a recurring Stripe Price.

After configuring the production database, apply the committed migration with:

```powershell
npm run prisma:migrate:deploy
```

The initial PostgreSQL migration creates an empty schema. It does not copy data from the former local SQLite database.
