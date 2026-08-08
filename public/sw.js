// SK Mission Board — Service Worker v11
const CACHE_NAME = 'sk-mission-board-v11';
const STATIC_CACHE = 'sk-static-v11';

// Core shell assets to pre-cache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.png',
  '/logo.png',
];

// ── Install: pre-cache shell & skip waiting ───────────────────────────────────
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => Promise.resolve());
    })
  );
});

// ── Listen for Skip Waiting ───────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ── Activate: purge ALL old caches & claim clients immediately ────────────────
self.addEventListener('activate', (event) => {
  const validCaches = [CACHE_NAME, STATIC_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => !validCaches.includes(name))
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
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

  // Vite-bundled assets (JS, CSS, fonts, hashed images):
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.ttf')
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
