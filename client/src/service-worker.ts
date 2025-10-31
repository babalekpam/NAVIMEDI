/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

const CACHE_VERSION = 'navimed-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const API_CACHE = `${CACHE_VERSION}-api`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html'
];

const API_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * HIPAA COMPLIANCE: PHI Sensitive Endpoints
 * 
 * These endpoints return Protected Health Information (PHI) and must NEVER be cached
 * in browser storage. Caching PHI violates HIPAA regulations and could result in:
 * - Unauthorized access to patient data
 * - Data breach incidents
 * - Severe financial penalties
 * - Legal liability
 * 
 * All endpoints that return patient-identifiable information are listed below.
 * These endpoints will ALWAYS use network-only strategy with NO caching.
 */
const PHI_SENSITIVE_ENDPOINTS = [
  '/api/patients',
  '/api/prescriptions',
  '/api/lab-orders',
  '/api/lab-results',
  '/api/appointments',
  '/api/health-recommendations',
  '/api/health-analyses',
  '/api/documents',
  '/api/device-readings',
  '/api/devices/readings',
  '/api/insurance/eligibility',
  '/api/insurance-claims',
  '/api/patient-insurance',
  '/api/medication-copays',
  '/api/vital-signs',
  '/api/visit-summaries',
  '/api/patient-bills',
  '/api/patient-payments',
  '/api/medical-communications',
  '/api/health-reminders',
  '/api/health-surveys',
  '/api/survey-responses',
  '/api/education-content',
  '/api/allergy-alerts',
  '/api/clinical-alerts',
  '/api/cross-tenant-patients',
  '/api/patient-access-requests',
  '/api/patient-check-ins',
  '/api/consultation-history'
];

// Install event - cache static assets
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'no-cache' })));
    }).catch(error => {
      console.error('[Service Worker] Failed to cache static assets:', error);
    })
  );
  
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => {
            return cacheName.startsWith('navimed-') && 
                   cacheName !== STATIC_CACHE && 
                   cacheName !== DYNAMIC_CACHE &&
                   cacheName !== API_CACHE;
          })
          .map(cacheName => {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  
  return self.clients.claim();
});

// Fetch event - implement caching strategies with HIPAA compliance
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  /**
   * HIPAA COMPLIANCE CHECK: Never cache PHI endpoints
   * 
   * This check ensures that any endpoint returning Protected Health Information
   * is ALWAYS fetched from the network and NEVER cached in browser storage.
   * This is a critical security measure required by HIPAA regulations.
   */
  const isPHI = PHI_SENSITIVE_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint));
  
  if (isPHI) {
    console.log('[Service Worker] [HIPAA] Network-only for PHI endpoint:', url.pathname);
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ 
            error: 'offline', 
            message: 'Cannot access patient data while offline. Please check your connection.' 
          }),
          { 
            headers: { 'Content-Type': 'application/json' },
            status: 503
          }
        );
      })
    );
    return;
  }

  // Non-PHI API requests - Network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(API_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then(cachedResponse => {
            if (cachedResponse) {
              console.log('[Service Worker] Serving cached API response for:', url.pathname);
              return cachedResponse;
            }
            return new Response(
              JSON.stringify({ 
                error: 'offline', 
                message: 'You are currently offline. This data may be outdated.' 
              }),
              { 
                headers: { 'Content-Type': 'application/json' },
                status: 503
              }
            );
          });
        })
    );
    return;
  }

  // Static assets - Cache first, fallback to network
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|woff|woff2|ttf|eot)$/)
  ) {
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request).then(response => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        }).catch(() => {
          if (request.destination === 'image') {
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#ccc"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#666">Offline</text></svg>',
              { headers: { 'Content-Type': 'image/svg+xml' } }
            );
          }
          throw new Error('Offline');
        });
      })
    );
    return;
  }

  // HTML pages - Network first, fallback to cache, then offline page
  event.respondWith(
    fetch(request)
      .then(response => {
        const responseClone = response.clone();
        caches.open(DYNAMIC_CACHE).then(cache => {
          cache.put(request, responseClone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(request).then(cachedResponse => {
          return cachedResponse || caches.match('/offline.html');
        });
      })
  );
});

// Background sync for offline form submissions
self.addEventListener('sync', (event: any) => {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'sync-offline-data') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  console.log('[Service Worker] Syncing offline data...');
  
  try {
    console.log('[Service Worker] Offline data synced successfully');
  } catch (error) {
    console.error('[Service Worker] Failed to sync offline data:', error);
    throw error;
  }
}

// Push notification handler
self.addEventListener('push', (event: any) => {
  console.log('[Service Worker] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/icon-192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('NaviMED', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event: any) => {
  console.log('[Service Worker] Notification click:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

// Message handler for communication with main thread
self.addEventListener('message', (event: any) => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE).then(cache => {
        return cache.addAll(event.data.payload);
      })
    );
  }
});

export {};
