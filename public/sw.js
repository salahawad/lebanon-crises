// Lebanon Relief — Service Worker
// Provides offline caching for the crisis coordination platform

const CACHE_VERSION = "v1";
const STATIC_CACHE = `lr-static-${CACHE_VERSION}`;
const DATA_CACHE = `lr-data-${CACHE_VERSION}`;
const IMAGE_CACHE = `lr-images-${CACHE_VERSION}`;

// App shell — precached on install
const PRECACHE_URLS = [
  "/",
  "/ar",
  "/en",
  "/manifest.json",
  "/icon.svg",
];

// API routes to cache at runtime
const DATA_ROUTES = [
  "/api/news",
  "/api/v0/gaps",
  "/api/v0/coverage",
  "/api/v0/orgs",
];

// ── Install: precache app shell ──────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: clean old caches ───────────────────────────────────────
self.addEventListener("activate", (event) => {
  const currentCaches = [STATIC_CACHE, DATA_CACHE, IMAGE_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => !currentCaches.includes(name))
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch strategies ─────────────────────────────────────────────────

function isNavigationRequest(request) {
  return request.mode === "navigate";
}

function isDataRoute(url) {
  return DATA_ROUTES.some((route) => url.pathname.startsWith(route));
}

function isImageRequest(url) {
  return (
    url.pathname.match(/\.(png|jpg|jpeg|webp|svg|gif|ico)$/) ||
    url.pathname.startsWith("/_next/image")
  );
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icon")
  );
}

// Network-first: try network, fall back to cache (for pages & API data)
async function networkFirst(request, cacheName, timeoutMs = 5000) {
  const cache = await caches.open(cacheName);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    // For navigation, return cached root page as fallback
    if (isNavigationRequest(request)) {
      const fallback = await cache.match("/");
      if (fallback) return fallback;
    }
    return new Response("Offline", { status: 503, statusText: "Offline" });
  }
}

// Stale-while-revalidate: return cache immediately, update in background
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);
  return cached || fetchPromise;
}

// Cache-first: use cache, only fetch if not cached (for static assets)
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503, statusText: "Offline" });
  }
}

// ── Main fetch handler ───────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // Static assets (JS/CSS bundles) — cache-first
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(event.request, STATIC_CACHE));
    return;
  }

  // Images — stale-while-revalidate
  if (isImageRequest(url)) {
    event.respondWith(staleWhileRevalidate(event.request, IMAGE_CACHE));
    return;
  }

  // API data routes — network-first with 5s timeout
  if (isDataRoute(url)) {
    event.respondWith(networkFirst(event.request, DATA_CACHE, 5000));
    return;
  }

  // Navigation (HTML pages) — network-first with 3s timeout
  if (isNavigationRequest(event.request)) {
    event.respondWith(networkFirst(event.request, STATIC_CACHE, 3000));
    return;
  }
});

// ── Message handler for manual cache control ─────────────────────────
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data === "CLEAR_DATA_CACHE") {
    caches.delete(DATA_CACHE);
  }

  if (event.data === "GET_CACHE_STATUS") {
    Promise.all([
      caches.open(STATIC_CACHE).then((c) => c.keys()),
      caches.open(DATA_CACHE).then((c) => c.keys()),
      caches.open(IMAGE_CACHE).then((c) => c.keys()),
    ]).then(([staticKeys, dataKeys, imageKeys]) => {
      event.source.postMessage({
        type: "CACHE_STATUS",
        static: staticKeys.length,
        data: dataKeys.length,
        images: imageKeys.length,
      });
    });
  }
});
