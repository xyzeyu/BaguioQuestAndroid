const CACHE = 'bq-shell-v1';
const ASSETS = [
'/',
'/index.html',
'/styles.css',
'/app.js',
'/manifest.webmanifest',
'/offline.html',
'/pages/features.html',
'/pages/help.html',
'/assets/baguio-hero.jpg',
'/icons/icon-192.png',
'/icons/icon-512.png',
'/icons/maskable-512.png'
];


self.addEventListener('install', (e)=>{
e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
self.skipWaiting();
});


self.addEventListener('activate', (e)=>{
e.waitUntil(
caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE && !k.startsWith('bq-data-')).map(k=>caches.delete(k))))
);
self.clients.claim();
});


self.addEventListener('fetch', (e)=>{
const { request } = e;
// App shell: try cache first, then network, then offline fallback
e.respondWith(
caches.match(request).then(cached => {
if (cached) return cached;
return fetch(request).catch(()=>{
if (request.destination === 'document') {
return caches.match('/offline.html');
}
});
})
);
});