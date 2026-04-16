// Service Worker for XiaoGao PWA
const CACHE_NAME = 'xiaogao-v1'

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

  // Don't cache API calls
  if (url.pathname.startsWith('/api') || url.hostname !== self.location.hostname) {
    return
  }

  // Cache-first for static assets
  if (url.pathname.match(/\.(js|css|woff2?|vrm|vrma|svg|png|jpg)$/)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          }
          return response
        })
      })
    )
    return
  }

  // Network-first for HTML
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  )
})
