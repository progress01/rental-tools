// 讓「工作日誌」沒有網路時也能打開（只快取網頁本身，資料存在手機裡）
// 每次都先跟網路要最新的（不用瀏覽器的舊快取），沒網路才用存起來的那份
const CACHE = 'worklog-v14';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' }))))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('worklog-') && k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(new Request(e.request.url, { cache: 'no-cache', credentials: 'same-origin' })).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./', { ignoreSearch: true })).then(r => r || Response.error())));
});
