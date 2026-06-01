/* SW v18 - AGRESSIVO: nunca serve HTML do cache */
const CACHE = 'sgss-v18';
const EXPECTED = 'sgss-v18';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
    .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({type:'window'})
        .then(cls => cls.forEach(c => c.postMessage({type:'SW_UPDATED',ver:EXPECTED}))))
  );
});

self.addEventListener('fetch', e => {
  const u = e.request.url;
  // NUNCA faz cache de HTML
  if(u.endsWith('/') || u.includes('.html') || u.includes('/sgss-smtt/')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  // APIs externas: sempre rede
  if(u.includes('firestore') || u.includes('googleapis') || u.includes('maps.google') ||
     u.includes('anthropic') || u.includes('unpkg') || u.includes('cdnjs') ||
     u.includes('nominatim') || u.includes('openstreetmap')) {
    return;
  }
  // Outros assets: network-first
  e.respondWith(
    fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    }).catch(() => caches.match(e.request))
  );
});
