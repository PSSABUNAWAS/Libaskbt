const CACHE_NAME = "liba-v2-structure";
const ASSETS = [
  "./",
  "./index.html",
  "./liba.css",
  "./app.js",
  "./manifest.json"
];
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});
self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
