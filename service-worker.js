const CACHE_NAME = 'mantenimiento-cache-v1';

const urlsToCache = [

    '/sistema-mantenimiento/',
    '/sistema-mantenimiento/index.html',
    '/sistema-mantenimiento/login.html',
    '/sistema-mantenimiento/pages/dashboard.html',
    '/sistema-mantenimiento/pages/app-tecnico.html'

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