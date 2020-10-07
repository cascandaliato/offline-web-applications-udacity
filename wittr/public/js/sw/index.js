self.addEventListener('install', (event) => {
  const urlsToCache = [
    '/',
    'js/main.js',
    'css/main.css',
    'imgs/icon.png',
    'https://fonts.gstatic.com/s/roboto/v15/2UX7WLTfW3W8TclTUvlFyQ.woff',
    'https://fonts.gstatic.com/s/roboto/v15/d-6IYplOFocCacKzxwXSOD8E0i7KZn-EPnyo3HZu7kw.woff',
  ];

  event.waitUntil(caches.open('wittr-static-v1').then((cache) => cache.addAll(urlsToCache)));
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

  event.respondWith(
    caches
      .open('wittr-static-v1')
      .then((cache) => cache.match(event.request))
      .then((response) => response || fetch(event.request.url)),
  );
});
