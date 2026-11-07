/* Sin caché de HTML principal, JavaScript ni tarifas: la cotización requiere red. */
const CACHE='hl-estaticos-v3';
const SAFE=['/not_found.html','/style.css','/icono-192.png','/icono-512.png','/icono-maskable.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>Promise.allSettled(SAFE.map(url=>cache.add(url)))).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
 if(url.pathname.endsWith('.js')){event.respondWith(fetch(event.request,{cache:'no-store'}));return;}
 if(event.request.mode==='navigate'){
  event.respondWith(fetch(event.request,{cache:'no-store'}).catch(async()=>{return new Response('<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sin conexión | Harold Lezcano</title><link rel="stylesheet" href="/style.css"></head><body><main class="container contact-section"><h1>Sin conexión</h1><p>El sitio y las cotizaciones requieren conexión. No mostramos tarifas guardadas para evitar presupuestos desactualizados.</p><p>Volvé a cargar esta página al conectarte.</p></main></body></html>',{status:503,headers:{'Content-Type':'text/html; charset=utf-8'}});}));return;
 }
 if(SAFE.includes(url.pathname))event.respondWith(fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)));}return response;}).catch(()=>caches.match(event.request).then(cached=>cached||Response.error())));
 // JS y cualquier otro recurso: red, sin guardar versiones de precios.
});
