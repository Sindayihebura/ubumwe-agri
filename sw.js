/**
 * UBUMWE AGRI — Service Worker Offline-First Complet
 * Fonctionne SANS internet sur tout appareil
 * Stratégie : Cache-First avec mise à jour en arrière-plan
 */

const CACHE_VERSION = 'ubumwe-v8';
const CACHE_STATIC  = CACHE_VERSION + '-static';
const CACHE_DYNAMIC = CACHE_VERSION + '-dynamic';

// Tous les fichiers à mettre en cache au premier chargement
const STATIC_ASSETS = [
    './',
    './index.html',
    './app.js',
    './sw.js',
    './manifest.json',
    './translations.js',
    './diseases_db.js',
    './security.js',
    './weather.js',
    './superadmin.js',
    './rating.js',
    // CSS compilé par Netlify build (Tailwind statique)
    './tailwind.css',
    // FontAwesome local
    './fontawesome.min.css',
    './fonts/plus-jakarta-sans.css',
    './fonts/75e255a1.woff2',
    './fonts/491b8db3.woff2',
    './fonts/0503470a.woff2',
    './fonts/b33395df.woff2',
    './fonts/76cdb1c1.woff2',
    './webfonts/fa-solid-900.woff2',
    './webfonts/fa-regular-400.woff2',
    './webfonts/fa-brands-400.woff2',
    './icon-192.png',
    './icon-512.png',
    './icon.svg',
    // Images locales produits
    './img-haricots.jpg.webp',
    './img-vaches.jpg.gif',
    './img-mais.jpg.webp',
    './img-poules.jpg.jpg',
    './img-chevre-local.jfif',
    './img-bananes.jpg.png',
    './img-porc.jfif',
    './img-cafe.jfif',
    './img-canard.jfif',
    './img-lapin.jfif',
    './img-mouton.jfif',
    './img-poisson.jfif',
    './img-mais-maladie.jpg.jpg',
];

// ── INSTALLATION ─────────────────────────────────────────────
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_STATIC)
            .then(cache => {
                console.log('[SW] Installation — mise en cache des ressources statiques');
                // addAll avec gestion d'erreurs individuelle
                return Promise.allSettled(
                    STATIC_ASSETS.map(url =>
                        cache.add(url).catch(e => console.warn('[SW] Cache fail:', url, e.message))
                    )
                );
            })
            .then(() => {
                console.log('[SW] Installation terminée');
                return self.skipWaiting();
            })
    );
});

// ── ACTIVATION ───────────────────────────────────────────────
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys
                    .filter(k => k !== CACHE_STATIC && k !== CACHE_DYNAMIC)
                    .map(k => {
                        console.log('[SW] Suppression ancien cache:', k);
                        return caches.delete(k);
                    })
            ))
            .then(() => self.clients.claim())
    );
});

// ── FETCH : Cache-First pour statique, Network-First pour données ─
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Ignorer les requêtes non-GET et les extensions navigateur
    if (event.request.method !== 'GET') return;
    if (url.protocol === 'chrome-extension:') return;
    if (url.origin !== location.origin && !url.href.includes('cdnjs') && !url.href.includes('fonts') && !url.href.includes('tailwindcss') && !url.href.includes('font-awesome')) return;

    // Stratégie Cache-First pour les ressources statiques locales
    if (url.origin === location.origin) {
        event.respondWith(cacheFirst(event.request));
        return;
    }

    // Stratégie Stale-While-Revalidate pour CDN (Tailwind, FontAwesome, polices)
    event.respondWith(staleWhileRevalidate(event.request));
});

// Cache-First : répond depuis le cache, sinon réseau + mise en cache
async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
        const response = await fetch(request);
        if (response && response.status === 200) {
            const cache = await caches.open(CACHE_STATIC);
            // Attendre la mise en cache pour détecter les erreurs (quota, etc.)
            await cache.put(request, response.clone());
        }
        return response;
    } catch {
        // Fallback HTML pour navigation offline
        if (request.headers.get('accept')?.includes('text/html')) {
            return caches.match('./index.html');
        }
        return new Response('Offline — ressource non disponible', { status: 503 });
    }
}

// Stale-While-Revalidate : répond immédiatement depuis cache + met à jour en arrière-plan
async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_DYNAMIC);
    const cached = await cache.match(request);

    const fetchPromise = fetch(request)
        .then(async response => {
            if (response && response.status === 200) {
                // await nécessaire pour catcher les erreurs de quota du Cache Storage
                await cache.put(request, response.clone());
            }
            return response;
        })
        .catch(() => null);

    return cached || await fetchPromise || new Response('Offline', { status: 503 });
}

// ── MESSAGE : Forcer la mise à jour du cache ──────────────────
self.addEventListener('message', event => {
    if (event.data?.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    if (event.data?.type === 'CLEAR_CACHE') {
        caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
        event.ports[0]?.postMessage({ cleared: true });
    }
});
