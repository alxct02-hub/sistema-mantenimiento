const CACHE_NAME = 'tecnico-cache-v1';

const urlsToCache = [

    '/sistema-mantenimiento/',
    '/sistema-mantenimiento/pages/app-tecnico.html',
    '/sistema-mantenimiento/login.html'

];

// ======================================
// INSTALAR
// ======================================

self.addEventListener('install', (event) => {

    event.waitUntil(

        caches.open(CACHE_NAME)

        .then((cache) => {

            return cache.addAll(urlsToCache);

        })

    );

});

// ======================================
// FETCH
// ======================================

self.addEventListener('fetch', (event) => {

    event.respondWith(

        caches.match(event.request)

        .then((response) => {

            return response || fetch(event.request);

        })

    );

});