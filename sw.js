/* Chitra Studio service worker: makes the app installable and usable offline (stale-while-revalidate). */
const V = 'chitra-v16';
const ASSETS = ['./', './index.html', './styles.css', './app.js', './photo.js', './layouts.js', './crop.js', './mockprods.js', './mockups.js', './photomock.js', './fonts.js', './graphics.js', './elements.js', './templates.js', './realtpl.js', './mocktpl.js', './tplspec.js', './home.js', './apps.js', './studio/qr.html', './studio/vendor/qrcode.min.js', './studio/vendor/JsBarcode.all.min.js', './studio/vendor/jszip.min.js', './polish.js', './studio.js', './cloud.js', './icons-duo.js', './icons.js', './config.js', './vendor/fabric.min.js', './vendor/jspdf.umd.min.js', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(V).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  // pages: network-first (new versions show up immediately); scripts/styles/data: cache-first + silent refresh (instant start, works offline)
  const nav = r.mode === 'navigate' || /\.html?$/.test(new URL(r.url).pathname);
  if (nav) { e.respondWith(fetch(r, { cache: 'no-cache' }).then(res => { if (res.ok) { const copy = res.clone(); caches.open(V).then(c => c.put(r, copy)); } return res; }).catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match('./index.html')))); return; }
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(hit => { const net = fetch(r).then(res => { if (res.ok) { const copy = res.clone(); caches.open(V).then(c => c.put(r, copy)); } return res; }).catch(() => hit); return hit || net; }));
});
