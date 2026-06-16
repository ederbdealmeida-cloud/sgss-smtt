/* SW v29-1781619710 */
const CACHE = 'sgss-v29-1781619710';

self.addEventListener('install', e => {{
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.skipWaiting())
  );
}});

self.addEventListener('activate', e => {{
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({{type:'window',includeUncontrolled:true}}))
      .then(clients => clients.forEach(c => c.navigate(c.url)))
  );
}});

self.addEventListener('fetch', e => {{
  const u = e.request.url;
  if(u.endsWith('/') || u.includes('.html') || u.includes('/sgss-smtt/') || u.includes('sw.js')) {{
    e.respondWith(fetch(e.request, {{cache:'no-store'}}).catch(() => caches.match(e.request)));
    return;
  }}
  if(u.includes('jsdelivr') || u.includes('cdnjs') || u.includes('unpkg')) {{
    e.respondWith(caches.match(e.request).then(cached => {{
      if(cached) return cached;
      return fetch(e.request).then(res => {{
        if(res && res.status===200) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      }}).catch(() => new Response('',{{status:503}}));
    }}));
    return;
  }}
  if(u.includes('firestore')||u.includes('googleapis')||u.includes('anthropic')||u.includes('nominatim')) return;
  e.respondWith(fetch(e.request, {{cache:'no-store'}}).catch(() => caches.match(e.request)));
}});
