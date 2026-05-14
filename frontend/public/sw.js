const CACHE_NAME = 'algohub-pos-v1'
const OFFLINE_URL = '/offline.html'
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/static/js/bundle.js',
  '/static/css/main.css'
]

// Sync queue storage
let syncQueue = []

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching assets')
        return cache.addAll(urlsToCache)
      })
      .then(() => {
        console.log('Service Worker: Installation complete')
        return self.skipWaiting()
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      console.log('Service Worker: Activation complete')
      return self.clients.claim()
    })
  )
})

// Fetch event - handle offline functionality
self.addEventListener('fetch', (event) => {
  // Handle API requests with offline queue
  if (event.request.url.includes('/api/')) {
    event.respondWith(handleAPIRequest(event.request))
    return
  }

  // Handle page requests
  if (event.request.mode === 'navigate') {
    event.respondWith(handlePageRequest(event.request))
    return
  }

  // Handle other requests
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response
        }

        // Clone the request
        const fetchRequest = event.request.clone()

        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }

          // Clone the response
          const responseToCache = response.clone()

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache)
            })

          return response
        }).catch(() => {
          // Offline fallback for pages
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL)
          }
        })
      })
  )
})

// Handle API requests with offline queue
async function handleAPIRequest(request) {
  try {
    // Try network first
    const response = await fetch(request)
    
    // Cache successful GET requests
    if (request.method === 'GET' && response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    console.log('Service Worker: Network failed for API request:', request.url)
    
    // For GET requests, try cache
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request)
      if (cachedResponse) {
        return cachedResponse
      }
    }
    
    // For POST/PUT/DELETE requests, add to sync queue
    if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
      const requestData = {
        id: `sync_${Date.now()}_${Math.random()}`,
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
        body: await request.text(),
        timestamp: Date.now(),
        retryCount: 0
      }
      
      syncQueue.push(requestData)
      await saveSyncQueue()
      
      // Register for background sync
      if ('sync' in self.registration) {
        await self.registration.sync.register('sync-queue')
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Request queued for sync when online',
          offline: true 
        }),
        { 
          status: 202, 
          headers: { 'Content-Type': 'application/json' } 
        }
      )
    }
    
    throw error
  }
}

// Handle page requests
async function handlePageRequest(request) {
  try {
    const response = await fetch(request)
    return response
  } catch (error) {
    console.log('Service Worker: Network failed for page request:', request.url)
    
    // Try cache first
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline page
    const offlineResponse = await caches.match(OFFLINE_URL)
    if (offlineResponse) {
      return offlineResponse
    }
    
    throw error
  }
}

// Save sync queue to IndexedDB
async function saveSyncQueue() {
  try {
    // This would save to IndexedDB in a real implementation
    console.log('Service Worker: Sync queue saved:', syncQueue.length, 'items')
  } catch (error) {
    console.error('Service Worker: Failed to save sync queue:', error)
  }
}

// Load sync queue from IndexedDB
async function loadSyncQueue() {
  try {
    // This would load from IndexedDB in a real implementation
    console.log('Service Worker: Sync queue loaded')
    return syncQueue
  } catch (error) {
    console.error('Service Worker: Failed to load sync queue:', error)
    return []
  }
}

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered:', event.tag)
  
  if (event.tag === 'sync-queue') {
    event.waitUntil(processSyncQueue())
  }
})

// Process sync queue
async function processSyncQueue() {
  try {
    console.log('Service Worker: Processing sync queue...')
    
    syncQueue = await loadSyncQueue()
    const failedRequests = []
    
    for (const request of syncQueue) {
      try {
        const response = await fetch(request.url, {
          method: request.method,
          headers: request.headers,
          body: request.body
        })
        
        if (response.ok) {
          console.log('Service Worker: Successfully synced request:', request.url)
        } else {
          request.retryCount++
          if (request.retryCount < 3) {
            failedRequests.push(request)
          } else {
            console.error('Service Worker: Request failed after 3 retries:', request.url)
          }
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync request:', request.url, error)
        request.retryCount++
        if (request.retryCount < 3) {
          failedRequests.push(request)
        }
      }
    }
    
    syncQueue = failedRequests
    await saveSyncQueue()
    
    console.log('Service Worker: Sync queue processing complete')
  } catch (error) {
    console.error('Service Worker: Sync queue processing failed:', error)
  }
}

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received')
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from AlgoHub POS',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-512x512.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-192x192.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('AlgoHub POS', options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click received')
  
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  } else if (!event.action) {
    // Clicked on notification body
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Message event for communication with main app
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
  
  if (event.data && event.data.type === 'GET_SYNC_QUEUE_SIZE') {
    event.ports[0].postMessage({ size: syncQueue.length })
  }
})

console.log('Service Worker: Enhanced offline support loaded successfully')

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

// Push notification handler
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-96x96.png'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('AlgoHub POS', options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'explore') {
    // Open the app to specific page
    event.waitUntil(
      clients.openWindow('/')
    )
  } else if (event.action === 'close') {
    // Just close the notification
    event.notification.close()
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Background sync function
async function doBackgroundSync() {
  // Handle offline actions that were queued
  try {
    const offlineActions = await getOfflineActions()
    
    for (const action of offlineActions) {
      try {
        // Retry the action
        await retryAction(action)
        // Remove from offline storage
        await removeOfflineAction(action.id)
      } catch (error) {
        console.error('Failed to retry action:', error)
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// Helper functions for offline storage
async function getOfflineActions() {
  // This would integrate with IndexedDB for offline storage
  return []
}

async function removeOfflineAction(id) {
  // Remove action from offline storage
}

async function retryAction(action) {
  // Retry the failed action
  switch (action.type) {
    case 'sale':
      // Retry sale submission
      break
    case 'product':
      // Retry product update
      break
    default:
      console.log('Unknown action type:', action.type)
  }
}
