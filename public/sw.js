// Shil Niwas service worker
// Strategy:
//  - App shell + static assets (icons, manifest): cache-first
//  - Page navigations (/, /units, /units/[id], /vacancy): network-first,
//    falling back to cache, falling back to /offline.html — so a page the
//    tenant/owner already opened once stays viewable offline, and anything
//    never visited shows a clear offline message instead of a browser error.
//  - /api/* : network-only. Bills, rent status, and readings must never be
//    served stale from cache — showing an old "unpaid" or old reading would
//    be actively misleading, not just inconvenient.

const CACHE_NAME = "shil-niwas-v1";
const OFFLINE_URL = "/offline.html";

const APP_SHELL = [
  "/",
  "/units",
  "/vacancy",
  "/offline.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never cache API calls — always hit the network so financial/status
  // data is never served stale.
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Page navigations: network-first, cache fallback, offline page last.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // Everything else (assets, uploaded photos, icons): cache-first,
  // populate cache on first successful fetch.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});
