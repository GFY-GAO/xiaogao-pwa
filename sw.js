// Service Worker for XiaoGao PWA
const CACHE_NAME = 'xiaogao-v4'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      )
    )
  )
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Don't cache API calls or cross-origin requests
  if (url.pathname.startsWith('/api') || url.hostname !== self.location.hostname) {
    return
  }

  // 3D assets are cached by IndexedDB in the app — skip Cache API to avoid double storage
  if (/\.(vrm|vrma|fbx)(\?.*)?$/.test(url.pathname)) {
    return
  }

  // Network-first for all resources (fixes stale cache issues)
  // Falls back to cache when offline
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return response
      })
      .catch(() => caches.match(event.request))
  )
})
