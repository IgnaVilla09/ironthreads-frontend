const CACHE = 'iron-offline-shell-v3';
self.addEventListener('install', (event) => { event.waitUntil(self.skipWaiting()); });
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
async function cachedOffline(request, options) {
  const previous = (await caches.keys()).filter((key) => key.startsWith('iron-offline-shell-') && key !== CACHE).reverse();
  for (const key of [CACHE, ...previous]) {
    const response = await (await caches.open(key)).match(request, options);
    if (response) return response;
  }
  return null;
}
self.addEventListener('message', (event) => {
  if (event.data?.type !== 'PREPARE_OFFLINE') return;
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE);
      const response = await fetch('/offline', { cache: 'reload' });
      if (!response.ok) throw new Error('Offline page unavailable');
      const html = await response.text();
      const assets = [...html.matchAll(/(?:src|href)="(\/_next\/static\/[^"?]+)[^"]*"/g)].map((match) => match[1]);
      await Promise.all([...new Set(assets)].map(async (asset) => {
        const file = await fetch(asset);
        if (!file.ok) throw new Error('Offline asset unavailable');
        if (asset.endsWith('.css')) {
          const css = await file.clone().text();
          for (const match of css.matchAll(/url\(([^)]+\/_next\/static\/media\/[^)]+)\)/g)) {
            const path = match[1].replace(/["']/g, '');
            const font = await fetch(path);
            if (font.ok) await cache.put(path, font);
          }
        }
        await cache.put(asset, file);
      }));
      // Only publish the offline page once all its scripts/styles are cached.
      await cache.put('/offline', new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } }));
      for (const key of await caches.keys()) {
        if (key.startsWith('iron-offline-shell-') && key !== CACHE) await caches.delete(key);
      }
      event.ports[0]?.postMessage({ ready: true });
    } catch { event.ports[0]?.postMessage({ ready: false }); }
  })());
});
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || event.request.method !== 'GET' || url.pathname.startsWith('/api/')) return;
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/assets/')) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      try {
        const response = await fetch(event.request);
        if (response.ok) await cache.put(event.request, response.clone());
        return response;
      } catch {
        return (await cachedOffline(event.request, { ignoreSearch: true })) || Response.error();
      }
    })());
  } else if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      try {
        const response = await fetch(event.request);
        if ((response.redirected && new URL(response.url).pathname === '/login') || response.status >= 500) {
          return (await cachedOffline('/offline')) || response;
        }
        return response;
      } catch {
        return (await cachedOffline('/offline')) || Response.error();
      }
    })());
  }
});
