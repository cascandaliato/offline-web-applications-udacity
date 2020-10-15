const staticCacheName = 'wittr-static-v6';
self.addEventListener('install', (event) => {
  const urlsToCache = [
    '/skeleton',
    'js/main.js',
    'css/main.css',
    'imgs/icon.png',
    'https://fonts.gstatic.com/s/roboto/v15/2UX7WLTfW3W8TclTUvlFyQ.woff',
    'https://fonts.gstatic.com/s/roboto/v15/d-6IYplOFocCacKzxwXSOD8E0i7KZn-EPnyo3HZu7kw.woff',
  ];

  event.waitUntil(caches.open(staticCacheName).then((cache) => cache.addAll(urlsToCache)));
});

self.addEventListener('activate', (event) => {
  // event.waitUntil(caches.delete('wittr-static-v1'));

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName.startsWith('wittr-') && cacheName != staticCacheName)
            .map((cacheName) => caches.delete(cacheName)),
        ),
      ),
  );
});

self.addEventListener('fetch', (event) => {
  // console.log('foo', event.request);

  // event.respondWith(
  //   new Response('Hello <b class="a-winner-is-me">World</b>', {
  //     headers: { foo: 'bar', 'Content-Type': 'text/html' },
  //   }),
  // );

  // if (event.request.url.endsWith('.jpg')) {
  //   event.respondWith(fetch('/imgs/dr-evil.gif'));
  // }

  // event.respondWith(
  //   fetch(event.request)
  //     // .then((response) => (response.status === 404 ? new Response('Whoops, not found') : response))
  //     .then((response) => (response.status === 404 ? fetch('/imgs/dr-evil.gif') : response))
  //     .catch(() => new Response('Uh oh, that totally failed!')),
  // );

  var requestUrl = new URL(event.request.url);
  if (requestUrl.origin === location.origin) {
    if (requestUrl.pathname === '/') {
      event.respondWith(caches.match('/skeleton'));
      return;
    }
  }

  event.respondWith(
    caches
      .open(staticCacheName)
      .then((cache) => cache.match(event.request))
      .then((response) => response || fetch(event.request.url)),
  );
});

self.addEventListener('message', function (event) {
  if (event.data.action === 'skipWaiting') self.skipWaiting();
});
