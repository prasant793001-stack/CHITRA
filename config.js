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
  photoProxy: '',
  // Fallback only (a deterrent, NOT real security): keys scrambled with tools/seal-key.js. Never paste raw keys in this public file.
  sealedKeys: {},
  plans: [
    { id: 'free', name: 'Free', price: 0, per: 'forever', blurb: 'Try everything small', features: ['5 saved designs', '3 saved print layouts', 'Core templates & elements', 'PNG / JPG export', 'Photo search & AI Art'] },
    { id: 'pro', name: 'Pro', price: 2, per: 'month', badge: 'Most popular', blurb: 'For makers & small shops', features: ['Unlimited designs & layouts', 'All Pro templates', 'AI background remover, Magic fix, Enhance', 'PDF at true paper size', 'DTF + sublimation print sheets', 'No watermark'] },
    { id: 'biz', name: 'Business', price: 6, per: 'month', blurb: 'For print shops & teams', features: ['Everything in Pro', 'Brand kit & shared layouts', '5 team seats', 'Bulk gang-sheet tools', 'Priority support'] },
  ],
};
