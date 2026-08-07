// SK Mission Board — Service Worker v5
// v5: intro video is now a bundled Vite asset (hashed URL under /assets/).
//     Cache strategy for /assets/ is already cache-first → offline support automatic.
const CACHE_NAME = 'sk-mission-board-v5';
const STATIC_CACHE = 'sk-static-v5';

// Core shell assets to pre-cache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.png',
  '/logo.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// ── Install: pre-cache shell ──────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => {
        // Don't fail install if some assets are missing
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

// ── Activate: remove ALL old caches ───────────────────────────────────────────
self.addEventListener('activate', (event) => {
  const validCaches = [CACHE_NAME, STATIC_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => !validCaches.includes(name))
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: caching strategies ─────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests on our origin
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Skip cross-origin requests (YouTube, Google Fonts, analytics, etc.)
  if (url.origin !== self.location.origin) return;

  // PDFs: network-first, cache as fallback
  if (url.pathname.startsWith('/pdfs/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Logo: network-first so fresh logo always shows
  if (url.pathname === '/logo.png') {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // Vite-bundled assets (JS, CSS, fonts, hashed images, hashed video):
  // These have content-hashed filenames → safe to cache forever (cache-first).
  // The intro video (intro.mp4 bundled as /assets/intro-HASH.mp4) is handled here,
  // giving 100% offline playback after the first load.
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.ttf') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.mp4')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // HTML navigation: network-first, fallback to cached index for SPA
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then(
          (cached) => cached || caches.match('/index.html')
        )
      )
  );
});
