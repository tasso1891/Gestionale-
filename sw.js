const CACHE = 'aree-verdi-v3';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e=>{
  if(e.request.method!=='GET') return;
  const u = new URL(e.request.url);
  // le richieste a Firebase/Google (database e login) non passano dal service worker
  if(u.origin!==self.location.origin && !u.hostname.endsWith('gstatic.com') && u.hostname!=='cdnjs.cloudflare.com') return;
  e.respondWith(
    fetch(e.request).then(r=>{
      const copia = r.clone();
      caches.open(CACHE).then(c=>c.put(e.request, copia)).catch(()=>{});
      return r;
    }).catch(()=> caches.match(e.request).then(r=> r || caches.match('index.html')))
  );
});
