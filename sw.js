const CACHE = 'sgss-smtt-v4';
const ASSETS = [
  '/sgss-smtt/',
  '/sgss-smtt/index.html',
  '/sgss-smtt/icon-192.png',
  '/sgss-smtt/icon-512.png',
  '/sgss-smtt/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  /* Firebase e APIs externas: sempre rede */
  if(e.request.url.includes('firestore') || 
     e.request.url.includes('googleapis') ||
     e.request.url.includes('nominatim') ||
     e.request.url.includes('openstreetmap') ||
     e.request.url.includes('maps.google') ||
     e.request.url.includes('anthropic')){
    return;
  }
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
