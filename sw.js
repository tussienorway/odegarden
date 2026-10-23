/* Service worker (prototype): nettverk først for sider, cache som reserve; cache først for statiske filer. */
const V="ode-v2",CORE=["./","index.html","app.html","losvekt.html","hagesenter.html","broyting.html","anleggsgartner.html","personvern.html","css/style.css","img/logo.svg","img/icon-192.png",
"js/gallery-data.js","js/ai-config.js","js/data.js","js/store.js","js/ai.js","js/ruting-config.js","js/ruting.js","js/db.js","js/anbud.js","js/chat.js","js/main.js","js/analytics-config.js","js/consent.js","content/nyheter.json","content/sesong.json","tilgjengelighet.html"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET"||new URL(r.url).origin!==location.origin)return;
  if(r.mode==="navigate"){e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(V).then(x=>x.put(r,c));return res}).catch(()=>caches.match(r).then(m=>m||caches.match("app.html"))));return}
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok&&!r.url.includes("/assets/video/")){const c=res.clone();caches.open(V).then(x=>x.put(r,c))}return res})))});
