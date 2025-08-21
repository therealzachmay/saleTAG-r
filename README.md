# saleTAG-r

This repo is a Next.js (App Router) TypeScript project using TailwindCSS, Prisma, and Stripe.

Quick start

1. Install dependencies:

```powershell
cd <project-directory>
npm install
```

2. Copy `.env.example` to `.env` and set values.

3. Generate Prisma client:

```powershell
npx prisma generate
```

4. Run dev server:

```powershell
npm run dev
# open http://localhost:3000
```

Notes
- The repo previously lacked a `package.json` and other configs; this adds a minimal manifest and tooling files.
- I did not install dependencies automatically. Run the commands above locally or tell me to install them for you.
