const CACHE = 'icebreaker-v4';
const PRECACHE = [
  './', './index.html', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png',
  './icons/icon-512-maskable.png', './icons/apple-touch-icon.png'
];
const APP_ROOT = new URL('./', self.location.href);
const INDEX = new URL('./index.html', APP_ROOT).href;
const ASSETS = new Set(PRECACHE.map((file) => new URL(file, APP_ROOT).href));

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(PRECACHE.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => /^icebreaker-v\d+$/.test(key) && key !== CACHE || key === 'icebreaker-fonts-v1')
        .map((key) => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  // 같은 도메인의 다른 앱이나 알 수 없는 경로를 캐시하지 않습니다.
  if (req.method !== 'GET' || !ASSETS.has(url.origin + url.pathname)) return;

  if (req.mode === 'navigate' || url.href.split('?')[0] === INDEX) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      try {
        const res = await fetch(req);
        if (res.ok && res.type !== 'opaque' && new URL(res.url || req.url).origin === APP_ROOT.origin) {
          // '/'와 'index.html'을 하나의 최신 캐시로 통일합니다.
          await cache.put(INDEX, res.clone()).catch(() => {});
          return res;
        }
        return (await cache.match(INDEX)) || res;
      } catch {
        return (await cache.match(INDEX)) || Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    return (await cache.match(req, { ignoreSearch: true })) || fetch(req);
  })());
});
