const CACHE = 'icebreaker-v3';
const FONT_CACHE = 'icebreaker-fonts-v1';
const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE && k !== FONT_CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Navigations / index.html: stale-while-revalidate (update shows on next load)
  if (req.mode === 'navigate' || (url.origin === location.origin && url.pathname.endsWith('/index.html'))) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = (await cache.match(req, { ignoreSearch: true })) || (await cache.match('./index.html'));
        const network = fetch(req).then((res) => {
          if (res && res.ok) cache.put('./index.html', res.clone());
          return res;
        }).catch(() => null);
        if (cached) { event.waitUntil(network); return cached; }
        return (await network) || Response.error();
      })
    );
    return;
  }

  // Pretendard font CDN: runtime cache (stale-while-revalidate), never break offline
  if (url.hostname === 'cdn.jsdelivr.net') {
    event.respondWith(
      caches.open(FONT_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        const network = fetch(req).then((res) => {
          if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
          return res;
        }).catch(() => null);
        if (cached) { event.waitUntil(network); return cached; }
        return (await network) || new Response('', { status: 504, headers: { 'Content-Type': 'text/css' } });
      })
    );
    return;
  }

  // Same-origin static: cache-first
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then((res) => {
        if (res && res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
        return res;
      }))
    );
  }
});
