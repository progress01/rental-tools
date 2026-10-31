// 讓「送信登記」沒有網路時也能打開（只快取網頁本身，不碰任何資料）
const CACHE = 'rental-tools-v11';
const FILES = ['./', './index.html', './send.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== 'share-inbox').map(k => caches.delete(k))))); self.clients.claim(); });
// 從 LINE 等 App「分享」Excel 過來：先把檔案放進暫存，再打開送信登記去讀
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method === 'POST' && u.searchParams.has('share')) {
    e.respondWith((async () => {
      try {
        const fd = await e.request.formData(), f = fd.get('file');
        if (f && f.size) { const c = await caches.open('share-inbox'); await c.put('shared-file', new Response(f, { headers: { 'x-name': encodeURIComponent(f.name || '分享的檔案.xlsx') } })); }
      } catch (err) {}
      return Response.redirect('./send.html?shared=1', 303);
    })());
  }
});
// 先拿網路上最新的，沒網路才用快取
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request)));
});
