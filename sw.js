const C = "tw-v010";
self.addEventListener("install", (e) =>
  e.waitUntil(
    caches
      .open(C)
      .then((c) =>
        c.addAll([
          "./index.html",
          "./manifest.json",
          "./icon-192.png",
          "./icon-512.png",
          "./apple-touch-icon.png",
          "./favicon-32.png",
        ]),
      )
      .then(() => self.skipWaiting()),
  ),
);
self.addEventListener("activate", (e) =>
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== C).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  ),
);
self.addEventListener("fetch", (e) => {
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then((r) => {
          const copy = r.clone();
          caches.open(C).then((c) => c.put("./index.html", copy));
          return r;
        })
        .catch(() => caches.match("./index.html")),
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(
      (cached) =>
        cached ||
        fetch(e.request).then((r) => {
          if (e.request.method === "GET" && new URL(e.request.url).origin === location.origin)
            caches.open(C).then((c) => c.put(e.request, r.clone()));
          return r;
        }),
    ),
  );
});
