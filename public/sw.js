// SK Mission Board — Service Worker v6
const CACHE_NAME = 'sk-mission-board-v6';
const STATIC_CACHE = 'sk-static-v6';

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
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

// ── Activate: purge ALL old caches ───────────────────────────────────────────
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

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) return;

  // PDFs: NEVER intercept or cache through SW — force direct browser network requests
  if (url.pathname.startsWith('/pdfs/')) {
    return;
  }

  // Videos and Audio: direct network streaming (skip range request issues)
  if (
    request.headers.has('range') ||
    request.destination === 'video' ||
    request.destination === 'audio' ||
    url.pathname.endsWith('.mp4')
  ) {
    return;
  }

  // Logo & Favicon: network-first
  if (url.pathname === '/logo.png' || url.pathname === '/favicon.png') {
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

  // Skip Vite dev server internal/source files
  if (url.pathname.startsWith('/src/') || url.pathname.includes('/@') || url.pathname.includes('node_modules')) {
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
    url.pathname.endsWith('.jpg')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((response) => {
            if (response.ok && response.status === 200) {
              const clone = response.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone)).catch(() => {});
            }
            return response;
          })
          .catch(() => {
            return fetch(request).catch(() => new Response('', { status: 404 }));
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
