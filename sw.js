self.addEventListener('install', e=>{
 e.waitUntil(caches.open('liba-cache').then(c=>c.addAll(['./','./index.html','./app.js','./liba.css'])));
});
self.addEventListener('fetch', e=>{
 e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
