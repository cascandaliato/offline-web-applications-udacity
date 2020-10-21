const staticCacheName = "wittr-static-v6";
const contentImgsCache = "wittr-content-imgs";
const allCaches = [staticCacheName, contentImgsCache];

self.addEventListener("install", (event) => {
  const urlsToCache = [
    "/skeleton",
    "js/main.js",
    "css/main.css",
    "imgs/icon.png",
    "https://fonts.gstatic.com/s/roboto/v15/2UX7WLTfW3W8TclTUvlFyQ.woff",
    "https://fonts.gstatic.com/s/roboto/v15/d-6IYplOFocCacKzxwXSOD8E0i7KZn-EPnyo3HZu7kw.woff",
  ];

  event.waitUntil(
    caches.open(staticCacheName).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("activate", (event) => {
  // event.waitUntil(caches.delete('wittr-static-v1'));

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter(
              (cacheName) =>
                cacheName.startsWith("wittr-") && !allCaches.includes(cacheName)
            )
            .map((cacheName) => caches.delete(cacheName))
        )
      )
  );
});

self.addEventListener("fetch", (event) => {
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
    if (requestUrl.pathname === "/") {
      event.respondWith(caches.match("/skeleton"));
      return;
    }
    if (requestUrl.pathname.startsWith("/photos/")) {
      event.respondWith(servePhoto(event.request));
      return;
    }
    if (requestUrl.pathname.startsWith("/avatars/")) {
      event.respondWith(serveAvatar(event.request));
      return;
    }
  }

  event.respondWith(
    caches
      .open(staticCacheName)
      .then((cache) => cache.match(event.request))
      .then((response) => response || fetch(event.request.url))
  );
});

function servePhoto(request) {
  const storageUrl = request.url.replace(/-\d+px\.jpg$/, "");
  return caches.open(contentImgsCache).then((cache) => {
    return cache.match(storageUrl).then((response) => {
      if (response) return response;
      return fetch(request.url).then((networkResponse) => {
        cache.put(storageUrl, networkResponse.clone());
        return networkResponse;
      });
    });
  });
}

function serveAvatar(request) {
  const storageUrl = request.url.replace(/-\dx\.jpg$/, "");
  return caches.open(contentImgsCache).then((cache) => {
    return cache.match(storageUrl).then((response) => {
      const networkFetch = fetch(request.url).then((networkResponse) => {
        cache.put(storageUrl, networkResponse.clone());
        return networkResponse;
      });
      return response || networkFetch;
    });
  });
}

self.addEventListener("message", function (event) {
  if (event.data.action === "skipWaiting") self.skipWaiting();
});
