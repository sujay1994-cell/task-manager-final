const CACHE_NAME = 'task-manager-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/main.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico'
];

const API_CACHE_NAME = 'api-cache-v1';
const FILE_CACHE_NAME = 'file-cache-v1';

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
  );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== CACHE_NAME &&
            cacheName !== API_CACHE_NAME &&
            cacheName !== FILE_CACHE_NAME
          ) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event handler
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
  }
  // Handle file requests
  else if (url.pathname.startsWith('/files/')) {
    event.respondWith(handleFileRequest(request));
  }
  // Handle static assets
  else {
    event.respondWith(handleStaticRequest(request));
  }
});

// Handle API requests
async function handleApiRequest(request) {
  // Try network first
  try {
    const response = await fetch(request);
    const cache = await caches.open(API_CACHE_NAME);
    
    // Cache successful GET requests
    if (request.method === 'GET' && response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // If offline, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If no cache, return offline response
    return new Response(
      JSON.stringify({ error: 'You are offline' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle file requests
async function handleFileRequest(request) {
  // Try cache first for files
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(FILE_CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response(
      'File not available offline',
      { status: 503 }
    );
  }
}

// Handle static asset requests
async function handleStaticRequest(request) {
  // Try cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    return new Response('Resource not available offline', { status: 503 });
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-tasks') {
    event.waitUntil(syncTasks());
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.message,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: {
      url: data.url
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Sync offline tasks
async function syncTasks() {
  const db = await openIndexedDB();
  const offlineTasks = await getAllOfflineTasks(db);
  
  for (const task of offlineTasks) {
    try {
      await syncTask(task);
      await removeOfflineTask(db, task.id);
    } catch (error) {
      console.error('Error syncing task:', error);
    }
  }
}

// IndexedDB helpers
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('taskManagerDB', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function getAllOfflineTasks(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['offlineTasks'], 'readonly');
    const store = transaction.objectStore('offlineTasks');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function removeOfflineTask(db, taskId) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['offlineTasks'], 'readwrite');
    const store = transaction.objectStore('offlineTasks');
    const request = store.delete(taskId);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function syncTask(task) {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(task)
  });
  
  if (!response.ok) {
    throw new Error('Failed to sync task');
  }
  
  return response.json();
} 