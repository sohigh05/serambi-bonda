/* Fail ini menyimpan halaman dan foto supaya PWA boleh dibuka semasa offline.
   Tukar nombor versi apabila kandungan laman dikemas kini. */
const CACHE_NAME = 'serambi-bonda-v1';
const LOCAL_FILES = [
  './', './index.html', './style.css', './script.js',
  './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png',
  './images/foto-01.jpg', './images/foto-02.jpg', './images/foto-03.jpg',
  './images/foto-04.jpg', './images/foto-05.jpg', './images/foto-06.jpg',
  './images/foto-07.jpg', './images/foto-08.jpg', './images/foto-09.jpg',
  './images/foto-10.jpg', './images/foto-11.jpg', './images/foto-12.jpg',
  './images/foto-13.jpg', './images/foto-14.jpg'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(LOCAL_FILES);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(names.filter(function (name) {
        return name !== CACHE_NAME;
      }).map(function (name) {
        return caches.delete(name);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  const request = event.request;
  const url = new URL(request.url);

  // Google Maps dan WhatsApp menggunakan rangkaian sendiri.
  if (url.origin !== self.location.origin || request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(function () {
        return caches.match('./index.html');
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(function (saved) {
      return saved || fetch(request);
    })
  );
});
