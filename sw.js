/* 코순이 키우기 서비스 워커 — VERSION은 빌드할 때 바뀝니다 */
const VERSION='f047041e31';
const CACHE='kosuni-'+VERSION;
const CORE=['./','index.html','manifest.webmanifest','pwa/icon-192.png','pwa/icon-512.png','pwa/apple-touch-icon.png',
  'assets/idle.webp','assets/sad.webp','assets/sleep.webp','assets/eat.webp','assets/angry.webp','assets/joy.webp','assets/surprise.webp'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('kosuni-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  const u=new URL(r.url); if(u.origin!==location.origin) return;
  if(r.mode==='navigate'){
    /* 페이지는 인터넷이 되면 최신, 안 되면 저장본 */
    e.respondWith(fetch(r).then(res=>{ const cp=res.clone(); caches.open(CACHE).then(c=>c.put('index.html',cp)); return res; }).catch(()=>caches.match('index.html').then(m=>m||caches.match('./'))));
    return;
  }
  /* 그림 등은 저장본 먼저, 없으면 받아서 저장 */
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{ if(res.ok){ const cp=res.clone(); caches.open(CACHE).then(c=>c.put(r,cp)); } return res; })));
});
