/* Chitra Studio – business settings. Edit this file to change brand, plans and prices. */
window.CHITRA_CONFIG = {
  brand: 'Chitra',
  currency: '$',
  // Turn on once real billing is connected. While false, everything is unlocked (the Pro marks are just labels).
  gating: false,
  // Paste a payment link (Stripe Payment Link, Razorpay, Lemon Squeezy…) to make "Choose plan" open real checkout.
  checkoutUrl: '',
  // Optional: a URL that returns the "Trending" list as JSON (see community.json for the format).
  communityFeed: 'community.json',
  // Photo search. SAFEST: deploy worker/photos-proxy.js (free Cloudflare Worker) and paste its URL here - the keys then never reach the browser.
  // URL of your deployed worker/api.js (accounts, cloud sync, subscriptions). Leave blank to run fully offline/local.
  apiUrl: '',
  // Optional: { plausibleDomain: 'yourdomain.com' } for privacy-friendly analytics. Error reports go to your worker (apiUrl) unless reportErrors:false.
  analytics: {},
  photoProxy: '',
  assetBase: '', // optional: host photos/ and data/ on another site (CDN or a second repo), e.g. 'https://cdn.jsdelivr.net/gh/you/chitra-assets@main/'
  // Where "Send to print" delivers orders (WhatsApp number with country code, email). Leave blank to just share the file.
  shop: { name: '', whatsapp: '', email: '' },
  // Fallback only (a deterrent, NOT real security): keys scrambled with tools/seal-key.js. Never paste raw keys in this public file.
  sealedKeys: {},
  trialDays: 7, // automatic free trial for every new account (set up on the server, no card needed)
  googleClientId: '', // optional: Google "Sign in" button (free). Create an OAuth Web client at console.cloud.google.com and paste its client id here
  plans: [
    { id: 'free', name: 'Free', price: 0, per: 'forever', blurb: 'After your trial', features: ['5 saved designs', '3 saved print layouts', 'Core templates & elements', 'PNG / JPG export', 'Photo search & AI Art'] },
    { id: 'month', name: 'Pro Monthly', price: 6.99, per: 'month', blurb: '7 days free, then $6.99 / month', features: ['Unlimited designs & layouts', 'All Pro templates & mock templates', 'Premium graphics, AI background remover', 'PDF at true paper size', 'DTF + sublimation print sheets', 'Cloud sync on every device', 'No watermark'] },
    { id: 'year', name: 'Pro Yearly', price: 69, per: 'year', badge: 'Best value · save 18%', blurb: '7 days free, then $69 / year', features: ['Everything in Pro Monthly', '2 months free', 'Priority support', 'Early access to new tools'] },
  ],
};
