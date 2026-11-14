const V = 'dessinarium-v1';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return; const u = new URL(r.url);
  if (u.origin === location.origin){        // le jeu : réseau d'abord (mises à jour), cache si hors connexion
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); return res; }).catch(() => caches.match(r).then(m => m || caches.match('index.html'))));
  } else if (/googleapis\.com$|gstatic\.com$/.test(u.hostname)){   // police : cache puis mise à jour
    e.respondWith(caches.open(V).then(c => c.match(r).then(m => { const net = fetch(r).then(res => { c.put(r, res.clone()); return res; }).catch(() => m); return m || net; })));
  }
});
