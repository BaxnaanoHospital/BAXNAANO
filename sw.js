/* ============================================================
   Baxnaano Booking — Service Worker
   Ujeeddada: app-shell-ka (index.html, manifest, icons) ha ku shaqeeyo
   xitaa marka internet la waayo (offline-first UI shell), laakiin
   xogta NOOCA (Supabase API, CDN scripts) had iyo jeer NETWORK ayaa
   la isticmaalayaa — lama cache-gareynayo, si xogtu ay mar walba
   ugu cusbooneyd tahay marka la xidhiidho.
============================================================ */
const CACHE_NAME = 'baxnaano-booking-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Kaliya same-origin GET requests ayaan cache-gareynaynaa (app-shell-ka
  // kaliya) — CDN-yada (jsQR/SweetAlert2/Supabase-js) iyo Supabase API-ga
  // (mid kale oo origin ah) had iyo jeer NETWORK ayaa loo mariyaa toos ah.
  if(event.request.method !== 'GET' || url.origin !== self.location.origin){
    return; // ha faragelin — browser-ku sida caadiga ah ha u qabto
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request).then((response) => {
        if(response && response.ok){
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(()=>{});
        }
        return response;
      }).catch(() => cached); // offline -> isticmaal cache-ga haddii la haysto
      return cached || networkFetch;
    })
  );
});
