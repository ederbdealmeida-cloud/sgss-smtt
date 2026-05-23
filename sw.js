const CACHE = 'sgss-v12';
const ASSETS = ['/sgss-smtt/','/sgss-smtt/index.html','/sgss-smtt/icon-192.png','/sgss-smtt/icon-512.png','/sgss-smtt/manifest.json'];

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
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => {
        // Avisa todas as paginas abertas para recarregar
        return self.clients.matchAll({type:'window'}).then(clients => {
          clients.forEach(client => client.postMessage({type:'SW_UPDATED'}));
        });
      })
  );
});

self.addEventListener('fetch', e => {
  const u = e.request.url;
  if(u.includes('firestore')||u.includes('googleapis')||u.includes('maps.google')||
     u.includes('anthropic')||u.includes('unpkg')||u.includes('cdnjs')||u.includes('fonts.google')) return;
  if(u.endsWith('/sgss-smtt/')||u.includes('index.html')){
    e.respondWith(
      fetch(e.request)
        .then(r => { caches.open(CACHE).then(c => c.put(e.request, r.clone())); return r; })
        .catch(() => caches.match(e.request))
    );
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
