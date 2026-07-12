/**
 * Service worker — gives us:
 *   - Offline play (cached HTML/CSS/JS)
 *   - Instant launches (no network round-trip on startup)
 *   - Auto-update: new SW activates on next launch when version changes
 *
 * Cache strategy:
 *   - App shell (HTML/CSS/JS/icons): cache-first, fallback to network
 *   - Firebase / external CDNs: network-first, cache as fallback
 *   - Google fonts: cache-first
 */

const VERSION = '2.0.0-dev';
const CACHE_NAME = `verbmaster-v${VERSION}`;

// App shell — files cached on install
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/main.js',
  '/src/config.js',
  '/src/data/store.js',
  '/src/data/localStore.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET
  if (event.request.method !== 'GET') return;

  // Network-first for Firebase / API calls
  const isApi = url.hostname.includes('firebaseio.com')
             || url.hostname.includes('googleapis.com')
             || url.hostname.includes('cloudfunctions.net');
  if (isApi) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // Cache-first for same-origin assets + same-origin code
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // External resources (Firebase SDK CDN, Google Fonts, etc.) — cache opportunistically
  event.respondWith(staleWhileRevalidate(event.request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const fresh = await fetch(request);
    if (fresh.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, fresh.clone());
    }
    return fresh;
  } catch (e) {
    // Network failed and nothing cached → offline fallback
    return caches.match('/index.html');
  }
}

async function networkFirst(request) {
  try {
    const fresh = await fetch(request);
    return fresh;
  } catch (e) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw e;
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const networkPromise = fetch(request).then(response => {
    if (response.ok) {
      caches.open(CACHE_NAME).then(c => c.put(request, response.clone()));
    }
    return response;
  }).catch(() => null);
  return cached || networkPromise;
}

// Allow page to trigger immediate SW update (e.g. after deploy)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
