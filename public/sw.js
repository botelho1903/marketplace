/**
 * Service Worker for Marketplace PWA
 * Provides offline support and caching strategies
 */

const CACHE_NAME = 'marketplace-v1';
const STATIC_CACHE = 'marketplace-static-v1';
const DYNAMIC_CACHE = 'marketplace-dynamic-v1';
const IMAGE_CACHE = 'marketplace-images-v1';

// Files to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/login',
  '/cadastro',
  '/busca',
  '/categorias',
  '/carrinho',
  '/checkout',
  '/vender',
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Cache first - for static assets
  cacheFirst: async (request, cacheName) => {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;

    try {
      const response = await fetch(request);
      if (response.ok) cache.put(request, response.clone());
      return response;
    } catch {
      return new Response('Offline', { status: 503 });
    }
  },

  // Network first - for API calls
  networkFirst: async (request, cacheName) => {
    const cache = await caches.open(cacheName);
    try {
      const response = await fetch(request);
      if (response.ok) cache.put(request, response.clone());
      return response;
    } catch {
      const cached = await cache.match(request);
      if (cached) return cached;
      return new Response(JSON.stringify({ error: 'Offline' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },

  // Stale while revalidate - for images
  staleWhileRevalidate: async (request, cacheName) => {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    const fetchPromise = fetch(request).then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    }).catch(() => cached);

    return cached || fetchPromise;
  },
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !name.includes('v1'))
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - route requests to appropriate strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) schemes
  if (!url.protocol.startsWith('http')) return;

  // API routes - Network first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      CACHE_STRATEGIES.networkFirst(request, DYNAMIC_CACHE)
    );
    return;
  }

  // Images - Stale while revalidate
  if (request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|webp|svg|gif|ico)$/)) {
    event.respondWith(
      CACHE_STRATEGIES.staleWhileRevalidate(request, IMAGE_CACHE)
    );
    return;
  }

  // Static assets - Cache first
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/manifest.json'
  ) {
    event.respondWith(
      CACHE_STRATEGIES.cacheFirst(request, STATIC_CACHE)
    );
    return;
  }

  // Pages - Network first with offline fallback
  if (request.destination === 'document') {
    event.respondWith(
      CACHE_STRATEGIES.networkFirst(request, DYNAMIC_CACHE)
    );
    return;
  }

  // Default - Network first
  event.respondWith(
    CACHE_STRATEGIES.networkFirst(request, DYNAMIC_CACHE)
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-cart') {
    event.waitUntil(syncCart());
  }
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders());
  }
});

async function syncCart() {
  // Implement cart sync when back online
  console.log('[SW] Syncing cart...');
}

async function syncOrders() {
  // Implement order sync when back online
  console.log('[SW] Syncing orders...');
}

// Push notifications (requires VAPID keys)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: data.actions || [],
    requireInteraction: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action) {
    // Handle action buttons
    clients.openWindow(event.action);
  } else if (event.notification.data?.url) {
    // Open URL from notification data
    clients.openWindow(event.notification.data.url);
  } else {
    // Default: open app
    clients.openWindow('/');
  }
});

// Periodic background sync (requires periodic-background-sync permission)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-products') {
    event.waitUntil(updateProductCache());
  }
});

async function updateProductCache() {
  // Pre-cache featured products
  console.log('[SW] Updating product cache...');
}

console.log('[SW] Service Worker loaded');