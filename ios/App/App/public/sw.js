// Service Worker for Carnet Patient App
const CACHE_NAME = 'carnet-patient-app-v1';
const OFFLINE_URL = '/mobile-app';

// Resources to cache for offline functionality
const urlsToCache = [
  '/mobile-app',
  '/src/main.tsx',
  '/src/index.css',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch Strategy: Network First with Cache Fallback
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests and chrome-extension requests
  if (!event.request.url.startsWith(self.location.origin) || 
      event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Handle API requests differently
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Only cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Return cached response if network fails
          return caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Return offline page for failed requests
              return caches.match(OFFLINE_URL);
            });
        })
    );
    return;
  }

  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // Handle other requests with cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response for caching
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

// Background Sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-vitals') {
    event.waitUntil(syncOfflineVitals());
  } else if (event.tag === 'background-sync-messages') {
    event.waitUntil(syncOfflineMessages());
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'You have a new health update',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'health-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icon-192.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icon-192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Carnet Health Alert', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/mobile-app')
    );
  }
});

// Sync offline vitals data
async function syncOfflineVitals() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const offlineData = await cache.match('/offline-vitals');
    
    if (offlineData) {
      const vitals = await offlineData.json();
      
      // Send to server
      const response = await fetch('/api/patients/vitals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getStoredToken()}`
        },
        body: JSON.stringify(vitals)
      });

      if (response.ok) {
        // Clear offline data after successful sync
        await cache.delete('/offline-vitals');
        console.log('Offline vitals synced successfully');
      }
    }
  } catch (error) {
    console.error('Failed to sync offline vitals:', error);
  }
}

// Sync offline messages
async function syncOfflineMessages() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const offlineData = await cache.match('/offline-messages');
    
    if (offlineData) {
      const messages = await offlineData.json();
      
      for (const message of messages) {
        try {
          const response = await fetch('/api/medical-communications', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${await getStoredToken()}`
            },
            body: JSON.stringify(message)
          });

          if (!response.ok) {
            console.error('Failed to sync message:', message.id);
          }
        } catch (error) {
          console.error('Error syncing message:', error);
        }
      }

      // Clear offline data after attempting sync
      await cache.delete('/offline-messages');
      console.log('Offline messages sync attempted');
    }
  } catch (error) {
    console.error('Failed to sync offline messages:', error);
  }
}

// Helper function to get stored auth token
async function getStoredToken() {
  // This would typically retrieve from IndexedDB or localStorage
  // For now, return empty string as token handling is managed by the app
  return '';
}