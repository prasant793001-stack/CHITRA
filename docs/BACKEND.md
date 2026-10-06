# Turning on accounts, cloud sync, subscriptions and approval links

Chitra works fully without a server. These steps (about 30 minutes, all on free tiers) switch on sign-in, cross-device sync, real subscriptions and customer approval links. The server code is `worker/api.js` and is covered by `tests/worker.test.mjs` and `tests/cloud.e2e.mjs`.

## 1. Cloudflare Worker
1. Create a free Cloudflare account, then `npm i -g wrangler && wrangler login`.
2. `wrangler kv namespace create DATA` → paste the printed `id` into `wrangler.toml`.
3. Edit `wrangler.toml`: `ALLOWED_ORIGIN` (your site's origin), `APP_URL`, `MAIL_FROM`.
4. Secrets (never commit these):
   ```
   wrangler secret put SESSION_SECRET        # any long random string
   wrangler secret put RESEND_KEY            # resend.com API key (free tier) - sends the sign-in codes
   wrangler secret put STRIPE_KEY            # Stripe secret key
   wrangler secret put STRIPE_WEBHOOK_SECRET # from step 2 below
   wrangler secret put PRICE_PRO             # Stripe price id, e.g. price_123
   wrangler secret put PRICE_BIZ
   ```
5. `wrangler deploy` → note the URL, e.g. `https://chitra-api.you.workers.dev`.
6. Put that URL in `config.js` as `apiUrl`. Done: a **Sign in** button appears on Home.

## 2. Stripe
1. Create two recurring Prices (Pro, Business) → copy their ids into the secrets above.
2. Developers → Webhooks → add endpoint `https://<your-worker>/billing/webhook` with events `checkout.session.completed` and `customer.subscription.deleted` → copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
3. In `config.js` set `gating: true` once you are happy, so Pro templates/features lock for free users.
   (Plan limits are enforced on the server too: free = 5 cloud designs.)

## 3. Photo keys
Deploy `worker/photos-proxy.js` the same way and set `photoProxy` in `config.js`; the Pixabay/Pexels keys then live only on the server.

## Local try-out (no accounts needed)
`npm run api` starts the same worker code on :8788 with an in-memory store and prints sign-in codes in the response, so you can test the whole flow offline.

## What is stored
Designs are stored as JSON per user in Cloudflare KV (limit 25 MB per design, the app refuses larger ones). Approval links keep one JPEG + comments for 30 days. Delete a design in the app and it stays in the cloud until you remove it from `/projects/:id` (DELETE) - wire that to the Delete button before launch if you want it automatic.
