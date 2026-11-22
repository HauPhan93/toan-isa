/* Toán ISA service worker: offline cache. Bump VERSION whenever app files change. */
const VERSION = 'toanisa-v5';
const CORE = [
  './', './index.html', './css/app.css', './manifest.webmanifest',
  './js/util.js', './js/visuals.js', './js/scratch.js', './js/core.js',
  './js/content/lop1.js', './js/content/lop2.js', './js/content/lop3.js', './js/content/lop4.js', './js/content/lop5.js', './js/content/dethi.js', './js/content/dethi-lop1.js',
  './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png',
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Network first (so updates arrive when online), cache as fallback; fonts are cached on first use.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
