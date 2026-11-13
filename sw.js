/* Grammar Quest 7 – app shell cache (Supabase API is never cached). */
const CACHE='grammar-quest-v7-2';
const ROOT='/Grammar-Quest/';
const APP=[
 ROOT,ROOT+'index.html',ROOT+'config.js',ROOT+'v5.css',
 ROOT+'v5-design.js',ROOT+'v5-game.js',ROOT+'v5-hub.js',
 ROOT+'v5-weekly.js',ROOT+'v6-endless.js',ROOT+'v7.css',
 ROOT+'v7-ui.js',ROOT+'v7-admin.js',ROOT+'manifest.webmanifest',ROOT+'app-icon.svg'
];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(APP)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(Promise.all([
   caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('grammar-quest-')&&k!==CACHE).map(k=>caches.delete(k)))),
   self.clients.claim()
 ]));
});
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET')return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin||!url.pathname.startsWith(ROOT))return;
 if(request.mode==='navigate'){
  event.respondWith(fetch(request).then(response=>{
   if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(ROOT+'index.html',copy));}
   return response;
  }).catch(()=>caches.match(ROOT+'index.html')));
  return;
 }
 event.respondWith(caches.match(request).then(hit=>{
  const fresh=fetch(request).then(response=>{
   if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy));}
   return response;
  }).catch(()=>hit);
  return hit||fresh;
 }));
});