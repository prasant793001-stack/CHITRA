/* Chitra Studio service worker: makes the app installable and usable offline (stale-while-revalidate). */
const V = 'chitra-v10';
const ASSETS = ['./', './index.html', './styles.css', './app.js', './photo.js', './layouts.js', './crop.js', './mockprods.js', './mockups.js', './fonts.js', './elements.js', './templates.js', './realtpl.js', './home.js', './polish.js', './studio.js', './cloud.js', './icons.js', './config.js', './vendor/fabric.min.js', './vendor/jspdf.umd.min.js', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(V).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  // network-first (always the newest version when online), cache as the offline fallback
  e.respondWith(fetch(r, { cache: 'no-cache' }).then(res => { if (res.ok) { const copy = res.clone(); caches.open(V).then(c => c.put(r, copy)); } return res; }).catch(() => caches.match(r, { ignoreSearch: true })));
});
