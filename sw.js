/* SW v21 - force cache clear */
const CACHE = 'sgss-v21';

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
  );
});

self.addEventListener('fetch', e => {
  const u = e.request.url;
  if(u.endsWith('/') || u.includes('.html') || u.includes('/sgss-smtt/')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  if(u.includes('jsdelivr') || u.includes('cdnjs') || u.includes('unpkg')) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if(cached) return cached;
        return fetch(e.request).then(res => {
          if(res && res.status===200)
            caches.open(CACHE).then(c => c.put(e.request, res.clone()));
          return res;
        }).catch(() => new Response('',{status:503}));
      })
    );
    return;
  }
  if(u.includes('firestore')||u.includes('googleapis')||u.includes('maps.google')||
     u.includes('anthropic')||u.includes('nominatim')||u.includes('openstreetmap')) {
    return;
  }
  e.respondWith(
    fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    }).catch(() => caches.match(e.request))
  );
});
