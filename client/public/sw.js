// KannadaSaathi Service Worker
const CACHE = 'kannadasaathi-app-v2';
const CACHE_PREFIX = 'kannadasaathi-';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) =>
        cache.addAll([
          '/',
          '/manifest.webmanifest'
        ])
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key.startsWith(CACHE_PREFIX) &&
                key !== CACHE
            )
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  // Cache phrase and category GET responses only.
  const cacheableApi =
    url.pathname === '/api/categories' ||
    url.pathname === '/api/phrases';

  if (cacheableApi) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);

        try {
          const response = await fetch(request);

          if (response.ok) {
            await cache.put(request, response.clone());
          }

          return response;
        } catch {
          const cached = await cache.match(request);

          if (cached) return cached;

          return Response.json(
            {
              error: 'This data has not been saved for offline use yet.'
            },
            { status: 503 }
          );
        }
      })()
    );

    return;
  }

  // Never cache other API calls such as chat, scan or practice.
  if (url.pathname.startsWith('/api/')) return;

  // Static files and navigation: network-first, cache fallback.
  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request);

        if (response.ok) {
          const cache = await caches.open(CACHE);
          await cache.put(request, response.clone());
        }

        return response;
      } catch {
        const cache = await caches.open(CACHE);
        const cached = await cache.match(request);

        if (cached) return cached;

        if (request.mode === 'navigate') {
          const shell = await cache.match('/');

          if (shell) return shell;
        }

        return Response.error();
      }
    })()
  );
});