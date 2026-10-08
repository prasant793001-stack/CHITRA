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

## Subscription, trial and Google sign-in ($6.99 / month · $69 / year · 7 days free)
Everything below is free to run for a start (Cloudflare Workers + KV free tier). You do **not** need a "duck server": DuckDNS is only a free sub-domain name for a server you run yourself, and the Worker already has a free `*.workers.dev` address (or point your own domain at it).

1. **Worker**: deploy `worker/api.js` (docs above). Variables: `SESSION_SECRET`, `ALLOWED_ORIGIN`, `APP_URL`, `RESEND_KEY`+`MAIL_FROM` (email codes), `GOOGLE_CLIENT_ID`, `STRIPE_KEY`, `STRIPE_WEBHOOK_SECRET`, `PRICE_MONTH`, `PRICE_YEAR`.
2. **7-day trial**: automatic. The first sign-in of every email starts it on the server (no card). Afterwards the account falls back to Free until a plan is bought.
3. **Google sign-in** (Google Cloud, free): console.cloud.google.com → APIs & Services → Credentials → OAuth client ID → *Web application* → add your site URL under *Authorised JavaScript origins*. Put the client id in `config.js` (`googleClientId`) and in the Worker variable `GOOGLE_CLIENT_ID`.
4. **Payments**: Stripe → create two recurring prices ($6.99/month, $69/year) and put their ids in `PRICE_MONTH` / `PRICE_YEAR`; add a webhook to `https://<worker>/billing/webhook` for `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`. Enable the Customer Portal so people can cancel or switch plan (the app's "Manage subscription" button opens it).
5. In `config.js` set `apiUrl` to the Worker address and `gating: true`.
