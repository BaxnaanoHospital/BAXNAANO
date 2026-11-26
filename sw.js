/* ============================================================
   Baxnaano Booking — Service Worker (v3, fudud & degdeg)
   - App-ka (index.html): NETWORK-FIRST laakiin 2.5 ilbiriqsi kadib
     haddii network-ku gaabis yahay, nuqulka cache-ga ayaa isla markiiba
     la tusayaa (koodhka cusubna gadaal ayuu ku soo degayaa).
   - CDN scripts (Supabase-js, SweetAlert2, jsQR) iyo fonts: cache-ga ayaa
     marka hore la isticmaalaa oo gadaal ayaa la cusboonaysiiyaa
     (stale-while-revalidate) — mar labaad app-ku si degdeg ah ayuu u furmaa.
   - Xogta (Supabase API) had iyo jeer NETWORK — lama cache-gareeyo.
============================================================ */
const CACHE_NAME = 'baxnaano-booking-v3';
const LIB_CACHE = 'baxnaano-libs-v1';
const APP_SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
const LIB_HOSTS = ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(APP_SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(names.filter((n) => n !== CACHE_NAME && n !== LIB_CACHE).map((n) => caches.delete(n))))
  );
  self.clients.claim();
});

function networkFirst(req) {
  const net = fetch(req).then((res) => {
    if (res && res.ok) { const copy = res.clone(); caches.open(CACHE_NAME).then((c) => c.put(req, copy)).catch(() => {}); }
    return res;
  });
  const timeout = new Promise((resolve) => setTimeout(() => caches.match(req).then((hit) => hit && resolve(hit)), 2500));
  return Promise.race([net.catch(() => caches.match(req)), timeout]).then((r) => r || net);
}

function staleWhileRevalidate(req) {
  return caches.open(LIB_CACHE).then((cache) => cache.match(req).then((hit) => {
    const net = fetch(req).then((res) => { if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone()).catch(() => {}); return res; }).catch(() => hit);
    return hit || net;
  }));
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) { event.respondWith(networkFirst(req)); return; }
  if (LIB_HOSTS.includes(url.hostname)) { event.respondWith(staleWhileRevalidate(req)); return; }
  // Supabase API iyo wixii kale: browser-ka ha u daayo (network).
});
