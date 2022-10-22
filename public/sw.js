const cacheName = "cache2"; // Change value to force update

self.addEventListener("install", event => {
  // Kick out the old service worker
  self.skipWaiting();

  event.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll([
        "/",
        "android-chrome-192x192.png", // Favicon, Android Chrome M39+ with 4.0 screen density
        "android-chrome-512x512.png", // Favicon, Android Chrome M47+ Splash screen with 4.0 screen density
        "apple-touch-icon.png", // Favicon, Apple default
        "favicon.ico", // Favicon, IE and fallback for other browsers
        "favicon-16x16.png", // Favicon, default
        "favicon-32x32.png", // Favicon, Safari on Mac OS
        "index.html", // Main HTML file
        "main.js", // Main Javascript file
        "site.webmanifest", // Manifest file
        "mstile-150x150.png", // Favicon, Windows 8 / IE11
        "safari-pinned-tab.svg", // Favicon, Safari pinned tab
        "main.css", // Main CSS file
        "api/enumbers",
        "api/descriptions",
        "https://code.jquery.com/ui/1.10.4/themes/ui-darkness/jquery-ui.css",
        "https://code.jquery.com/jquery-1.10.2.js",
        "https://code.jquery.com/ui/1.10.4/jquery-ui.js"
      ]);
    })
  );
});

self.addEventListener("activate", event => {
  // Delete any non-current cache
  event.waitUntil(
    caches.keys().then(keys => {
      Promise.all(
        keys.map(key => {
          if (![cacheName].includes(key)) {
            return caches.delete(key);
          }
        })
      )
    })
  );
});

// Offline-first, cache-first strategy
// Kick off two asynchronous requests, one to the cache and one to the network
// If there's a cached version available, use it, but fetch an update for next time.
// Gets data on screen as quickly as possible, then updates once the network has returned the latest data. 
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.open(cacheName).then(cache => {
      return fetch(event.request).then((fetchedResponse) => {
        cache.put(event.request.url, fetchedResponse.clone());
        // }

        return fetchedResponse;
      }).catch(() => {
        // If the network is unavailable, get it from the cache
        return cache.match(event.request.url);
      });
    })
  );
});