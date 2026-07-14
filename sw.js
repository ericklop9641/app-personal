/* Service worker: cachea la app para uso offline en el iPhone. */
const CACHE = 'sensia-v1';
const ASSETS = [
  'index.html',
  'css/styles.css',
  'js/app.js',
  'js/data.js',
  'manifest.webmanifest',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// cache-first para los assets propios; red como respaldo
self.addEventListener('fetch', e => {
  const { request } = e;
  if (request.method !== 'GET') return;
  e.respondWith(
    caches.match(request).then(cached =>
      cached || fetch(request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(request, copy)).catch(() => {});
        return resp;
      }).catch(() => caches.match('index.html'))
    )
  );
});
