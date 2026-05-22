/* SGSS Service Worker v6 */
const CACHE = 'sgss-v6';
const ASSETS = [
  '/sgss-smtt/',
  '/sgss-smtt/index.html',
  '/sgss-smtt/icon-192.png',
  '/sgss-smtt/icon-512.png',
  '/sgss-smtt/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  /* Sempre da rede: Firebase, APIs externas */
  if(url.includes('firestore') || url.includes('googleapis') ||
     url.includes('maps.google') || url.includes('anthropic') ||
     url.includes('unpkg.com') || url.includes('cdnjs') ||
     url.includes('fonts.google')){
    return;
  }
  /* index.html: network-first para ter sempre versao mais recente */
  if(url.endsWith('/sgss-smtt/') || url.includes('index.html')){
    e.respondWith(
      fetch(e.request)
        .then(r => {
          caches.open(CACHE).then(c => c.put(e.request, r.clone()));
          return r;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }
  /* Outros assets: cache-first */
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
