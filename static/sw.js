const CACHE_NAME = 'halalneo-v1';
const STATIC_ASSETS = [
	'/',
	'/manifest.json',
	'/icons/icon-192.svg',
	'/icons/icon-512.svg',
	'/fonts/plus-jakarta-sans/plus-jakarta-sans-latin.woff2',
	'/fonts/plus-jakarta-sans/plus-jakarta-sans-latin-ext.woff2',
	'/fonts/almarai/almarai-400.woff2',
	'/fonts/almarai/almarai-700.woff2'
];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
	);
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((keys) =>
			Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
		)
	);
	self.clients.claim();
});

self.addEventListener('fetch', (event) => {
	const { request } = event;

	if (request.method !== 'GET') return;

	if (request.url.includes('/api/')) {
		event.respondWith(
			fetch(request).catch(() => caches.match(request))
		);
		return;
	}

	event.respondWith(
		caches.match(request).then((cached) => {
			const fetched = fetch(request).then((response) => {
				if (response && response.status === 200) {
					const clone = response.clone();
					caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
				}
				return response;
			});
			return cached || fetched;
		})
	);
});
