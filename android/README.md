# SaleTAGr Android app (Trusted Web Activity)

The Play app is a thin Android shell (Trusted Web Activity) around the live site. Purchases inside it use
Google Play billing (required by Play policy for digital goods); the website keeps using Stripe.

## 1. Production env vars (Vercel)
| Var | Value |
| --- | --- |
| `DATABASE_URL` | Postgres URL (Neon / Supabase / Vercel Postgres) |
| `NEXT_PUBLIC_BASE_URL` | `https://<your-domain>` |
| `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` | live Stripe keys (web checkout) |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | admin basic auth |
| `ANDROID_PACKAGE_NAME` | `com.therealzachmay.saletagr` |
| `ANDROID_SHA256_FINGERPRINTS` | Play App Signing SHA-256 (Play Console > Test and release > App integrity), plus upload key, comma-separated |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | service account key JSON (see step 4) |
| `NEXT_PUBLIC_PLAY_LISTING_SKU` | `listing_3day` |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | support address shown on /privacy |

Run `npm run prisma:migrate:deploy` once against the production DB.

## 2. Build the app bundle
```bash
npm i -g @bubblewrap/cli
cd android
# edit twa-manifest.json: replace REPLACE_WITH_PRODUCTION_DOMAIN
bubblewrap init --manifest https://<your-domain>/manifest.webmanifest   # or: bubblewrap update (uses twa-manifest.json)
bubblewrap build        # -> app-release-bundle.aab (signed with the upload key)
```
Keep `saletagr-upload.keystore` and its password safe and OUT of git.

## 3. Play Console
1. Create app "SaleTAGr" (App, Free, contains in-app purchases).
2. Monetize > Products > In-app products: create `listing_3day`, $7.99, activate.
3. Upload the .aab to Internal testing first, then copy the App Signing SHA-256 into `ANDROID_SHA256_FINGERPRINTS` and redeploy, so `/.well-known/assetlinks.json` matches (otherwise a browser bar shows).
4. Google Cloud: create a service account, download its JSON key, enable "Google Play Android Developer API"; in Play Console > Users and permissions invite the service account email with View financial data + Manage orders.
5. Store listing: icon `store/play-icon-512.png`, feature graphic `store/feature-graphic-1024x500.png`, 2+ phone screenshots, privacy policy URL `https://<your-domain>/privacy`.
6. App content: Data safety (collects email + approximate address entered by user, shared with payment processor, not sold), content rating (Everyone), target audience 18+, ads: none.

## 4. Testing gate (new personal accounts)
Closed test with at least 12 testers opted in for 14 consecutive days, then Dashboard > Apply for production.
Add your own Google account as a license tester (Setup > License testing) to buy `listing_3day` without being charged.
