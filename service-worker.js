// Service Worker for Offline Map Caching
const CACHE_NAME = 'phone-tracker-v1';
const TILE_CACHE = 'map-tiles-v1';

// Files to cache for offline use
const STATIC_CACHE = [
    './',
    './index.html',
    './tracking.js',
    './styles.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://cdn.jsdelivr.net/npm/leaflet.heat@0.2.0/dist/leaflet-heat.min.js'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME && cache !== TILE_CACHE) {
                        console.log('Service Worker: Deleting old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Cache map tiles separately
    if (url.hostname.includes('tile.openstreetmap.org') || 
        url.hostname.includes('arcgisonline.com') ||
        url.hostname.includes('opentopomap.org')) {
        event.respondWith(
            caches.open(TILE_CACHE).then(cache => {
                return cache.match(request).then(response => {
                    if (response) {
                        return response;
                    }
                    
                    return fetch(request).then(networkResponse => {
                        // Cache the tile for offline use
                        cache.put(request, networkResponse.clone());
                        return networkResponse;
                    }).catch(() => {
                        // Return a placeholder if offline and not cached
                        return new Response('Tile not available offline', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
                });
            })
        );
        return;
    }
    
    // For other requests, try cache first, then network
    event.respondWith(
        caches.match(request).then(response => {
            if (response) {
                return response;
            }
            
            return fetch(request).then(networkResponse => {
                // Cache GET requests
                if (request.method === 'GET') {
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, networkResponse.clone());
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Return offline page or error message
                if (request.destination === 'document') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});

// Message event - for cache management
self.addEventListener('message', event => {
    if (event.data.action === 'clearCache') {
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cache => caches.delete(cache))
                );
            }).then(() => {
                event.ports[0].postMessage({ success: true });
            })
        );
    }
    
    if (event.data.action === 'getCacheSize') {
        event.waitUntil(
            caches.open(TILE_CACHE).then(cache => {
                return cache.keys();
            }).then(keys => {
                event.ports[0].postMessage({ 
                    tileCount: keys.length 
                });
            })
        );
    }
});
