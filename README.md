# saleTAG-r

saleTAG-r is a mobile-first Next.js (App Router) TypeScript app that helps garage sale hosts create QR-code-enabled flyers. Hosts pay for a printable flyer, receive a unique QR that links to the sale's mobile page, and when a buyer scans the QR the phone will open directions (maps/GPS) to the sale location.

Key points

- Mobile-first Progressive Web App (PWA) experience for buyers and hosts.
- Hosts can purchase printable, QR-enabled flyers that point to a sale page with GPS directions.
- Stripe is used only to accept payment for flyers. No other Stripe usage is required or intended.
- Flyers are printable PDFs (or images) that include a QR code linking to a sale landing page (sale ID + location). When scanned, the link opens on mobile and can provide turn-by-turn directions using the device's map app.

Tech stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- Stripe (payments for printable flyers only)

Quick start (development)

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and set values. Required environment variables include:

- DATABASE_URL — PostgreSQL connection string
- NEXT_PUBLIC_BASE_URL — public URL for your app (e.g. https://example.com or http://localhost:3000)
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY — Stripe publishable key for client-side checkout
- STRIPE_SECRET_KEY — Stripe secret key for server-side payment handling
- STRIPE_WEBHOOK_SECRET — Stripe webhook signing secret (if using webhooks)
- ADMIN_USERNAME and ADMIN_PASSWORD — credentials for any admin UI (if implemented)

Only use Stripe for accepting payments for the flyers. The application flow should not use Stripe for subscriptions, in-app payments, or any non-flyer-related charging.

3. Apply database migrations:

```bash
npm run prisma:migrate
```

4. Run the development server:

```bash
npm run dev
# open http://localhost:3000
```

Vercel / production notes

- Configure the same environment variables in your Vercel (or hosting) environment.
- After configuring the production database, apply the committed migration with:

```bash
npm run prisma:migrate:deploy
```

How the flyer and QR flow should work (implementation guidance)

1. Host creates a sale with a location (latitude/longitude or address).
2. Host purchases one or more printable flyers. Payment is handled via Stripe checkout or PaymentIntent; Stripe is only used to take the flyer payment.
3. On successful payment, the app generates a printable flyer (PDF or high-resolution image) that includes:
   - Sale title, date/time, short description
   - A QR code that encodes a link to the public sale page (e.g. `${NEXT_PUBLIC_BASE_URL}/sale/<sale-id>?ref=flyer`)
4. When a buyer scans the QR with their phone, the link opens the sale's mobile-optimized page. The page detects the user's device and offers a button to open the device's default mapping/navigation app with directions to the sale location (using geo: or maps URL schemes, or linking to Google Maps / Apple Maps with the sale coordinates).

Security and privacy notes

- Only collect the minimum required information for a sale (title, time, location, optional description).
- Do not store sensitive payment data — rely on Stripe tokens / PaymentIntents and follow Stripe's recommended best practices.
- Validate and sanitize any address/location input before saving.

Suggested code changes (I can make these edits for you if you want):

- Find all usages of Stripe in server and client code and ensure they are limited to flyer payment endpoints (checkout, webhook, payment confirmation). Avoid any usage of Stripe for features outside flyer purchases.
- Add (or verify) an API route that, after successful payment, creates the flyer asset and returns a printable PDF or image URL.
- Add a route/view for the public sale page (`/sale/[id]`) that is mobile-optimized and exposes a prominent "Get directions" button that opens maps with the sale coordinates.
- Add QR generation (server-side or build-time) that embeds the correct sale URL. Common libraries: qrcode, qrcode.react, or using a server-side PDF generator (e.g., Puppeteer, PDFKit) to embed an SVG/PNG QR into the flyer.
- Add tests around the payment -> flyer generation flow, and verify webhooks (if used) are idempotent.

Next steps I will take now

1. Search the repository for Stripe-related code so we can identify places to restrict Stripe usage to flyer payments and update them accordingly.

If you'd like, I can (a) open PRs to make the code-side changes for Stripe scoping and flyer generation, (b) create issues to track the implementation tasks above, or (c) implement the edits directly — tell me which you'd prefer.
