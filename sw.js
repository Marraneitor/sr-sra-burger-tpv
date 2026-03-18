// Gestia POS — Service Worker
// Cachea la shell de la app para carga offline real.
// Versión: actualizar CACHE_NAME al hacer un deploy significativo.

const CACHE_NAME = 'gestia-shell-v1';

const SHELL_FILES = [
  '/',
  '/index.html',
  '/styles/responsive.css',
  '/styles/saas2026.css',
  '/styles/enhancements.css',
  '/icono.ico',
];

// Instalar: cachear todos los archivos de la shell
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Activar inmediatamente sin esperar cierre de tabs
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(SHELL_FILES);
    }).catch((err) => {
      console.warn('[SW] Error al pre-cachear shell:', err);
    })
  );
});

// Activar: limpiar caches de versiones anteriores
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: Cache-first para shell, Network-first para Firebase/CDN requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // No interceptar requests a Firebase, Google APIs ni CDNs externos
  const isExternal = url.hostname !== self.location.hostname;
  if (isExternal) return;

  // No interceptar requests que no son GET
  if (event.request.method !== 'GET') return;

  // No interceptar firebase-config.json (evitar que un config cacheado rompa la app)
  if (url.pathname === '/firebase-config.json') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      // Si está cacheado, devolverlo. Si no, buscar en red.
      if (cached) return cached;
      return fetch(event.request).then((networkResponse) => {
        // Cachear respuestas de archivos locales para siguientes cargas
        if (networkResponse.ok && SHELL_FILES.includes(url.pathname)) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      }).catch(() => {
        // Sin cache y sin red — devolver index.html como fallback para SPA
        if (url.pathname.startsWith('/') && !url.pathname.includes('.')) {
          return caches.match('/index.html');
        }
      });
    })
  );
});
