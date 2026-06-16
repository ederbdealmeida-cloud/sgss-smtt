/* SW v27-1781619260 */
const CACHE = 'sgss-v27-1781619260';

self.addEventListener('install', e => {
  /* Limpar TODOS os caches antigos e ativar imediatamente */
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => {
        /* Notificar todos os clientes para recarregar */
        self.clients.matchAll({type:'window'}).then(clients => {
          clients.forEach(c => c.navigate(c.url));
        });
      })
  );
});

self.addEventListener('fetch', e => {
  const u = e.request.url;
  /* HTML principal: sempre busca da rede */
  if(u.endsWith('/') || u.includes('.html') || u.includes('/sgss-smtt/')) {
    e.respondWith(
      fetch(e.request, {cache:'no-store'})
        .catch(() => caches.match(e.request))
    );
    return;
  }
  /* CDN libs: cache-first */
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
  /* APIs externas: sempre rede */
  if(u.includes('firestore')||u.includes('googleapis')||u.includes('maps.google')||
     u.includes('anthropic')||u.includes('nominatim')||u.includes('openstreetmap')) {
    return;
  }
  /* Resto: network-first */
  e.respondWith(
    fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    }).catch(() => caches.match(e.request))
  );
});
