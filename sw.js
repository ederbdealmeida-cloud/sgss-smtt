/* SW v14 - NUNCA faz cache do index.html */
const CACHE = 'sgss-v14';

self.addEventListener('install', e => {
  e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({type:'window'})
        .then(cls => cls.forEach(c => c.postMessage({type:'SW_UPDATED'}))))
  );
});

self.addEventListener('fetch', e => {
  const u = e.request.url;
  // APIs externas: sempre rede
  if(u.includes('firestore')||u.includes('googleapis')||u.includes('maps.google')||
     u.includes('anthropic')||u.includes('unpkg')||u.includes('cdnjs')||u.includes('fonts.google')) return;
  // index.html: SEMPRE da rede, nunca cache
  if(u.endsWith('/sgss-smtt/')||u.includes('index.html')){
    e.respondWith(fetch(e.request));
    return;
  }
  // Outros assets: cache-first
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
    caches.open(CACHE).then(c => c.put(e.request, res.clone()));
    return res;
  })));
});
