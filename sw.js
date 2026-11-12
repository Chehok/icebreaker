const CACHE = 'icebreaker-v24';
const FONT_CACHE = 'icebreaker-fonts-v1';
const FONT_ORIGIN = 'https://cdn.jsdelivr.net';
const APP_ROOT = new URL('./', self.location.href);
const PAGES = new Map([
  ['', './'], ['index.html', './'],
  ['balance', './balance.html'], ['balance.html', './balance.html'],
  ['who', './who.html'], ['who.html', './who.html'],
  ['privacy', './privacy.html'], ['privacy.html', './privacy.html']
]);
const ASSETS = new Set([
  './app.css', './app.js', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png',
  './icons/icon-512-maskable.png', './icons/apple-touch-icon.png'
].map((file) => new URL(file, APP_ROOT).href));
const PRECACHE = [...ASSETS, ...Array.from(new Set(PAGES.values()), (page) => new URL(page, APP_ROOT).href)];

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
      keys.filter((key) => /^icebreaker-v\d+$/.test(key) && key !== CACHE)
        .map((key) => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  // GoatCounter 통계 요청은 가로채지 않고 네트워크로 바로 보냅니다(오프라인이면 조용히 실패).
  if (url.hostname === 'gc.zgo.at' || url.hostname === 'goatcounter.com' || url.hostname.endsWith('.goatcounter.com')) return;
  // Pretendard 글꼴(CSS·woff2)은 처음 받은 뒤 캐시에서 바로 씁니다. 오프라인이면 시스템 글꼴로 대체됩니다.
  if (req.method === 'GET' && url.origin === FONT_ORIGIN && url.pathname.startsWith('/gh/orioncactus/pretendard@')) {
    event.respondWith((async () => {
      const cache = await caches.open(FONT_CACHE);
      const hit = await cache.match(req);
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res.ok || res.type === 'opaque') cache.put(req, res.clone()).catch(() => {});
        return res;
      } catch {
        return new Response('', { status: 503, headers: { 'Content-Type': 'text/css' } });
      }
    })());
    return;
  }
  // 같은 도메인의 다른 앱이나 알 수 없는 경로를 캐시하지 않습니다.
  if (req.method !== 'GET' || !url.href.startsWith(APP_ROOT.href)) return;

  const page = PAGES.get(url.pathname.slice(APP_ROOT.pathname.length));
  if (req.mode === 'navigate' && page) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const key = new URL(page, APP_ROOT).href;
      const cached = await cache.match(key);
      if (cached) {
        event.waitUntil(fetch(req).then((res) => {
          if (res.ok && res.type !== 'opaqueredirect') return cache.put(key, res);
        }).catch(() => {}));
        // Serve the app shell immediately and check for updates in the background.
        if (cached.redirected) return new Response(cached.body, { headers: cached.headers });
        return cached;
      }
      let response;
      try {
        response = await fetch(req);
        if (response.type === 'opaqueredirect') return response;
        if (response.ok) {
          await cache.put(key, response.clone()).catch(() => {});
          return response;
        }
      } catch {
        // 오프라인이면 요청한 페이지를 캐시에서 찾습니다.
      }
      const fallback = await cache.match(key);
      // Cloudflare의 .html 리디렉션을 따라 받아 둔 응답도 탐색에 사용할 수 있게 합니다.
      if (fallback?.redirected) return new Response(fallback.body, { headers: fallback.headers });
      return fallback || response || Response.error();
    })());
    return;
  }

  if (!ASSETS.has(url.origin + url.pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    return (await cache.match(req, { ignoreSearch: true })) || fetch(req);
  })());
});
