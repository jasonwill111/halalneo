/**
 * HalalNeo Service Worker — production-grade caching for global users.
 *
 * Strategies:
 *   Static assets (_app/, fonts/, icons/)  → cache-first (immutable)
 *   Fonts                                  → cache-first (immutable)
 *   Images (api/media/)                    → cache-first (immutable, small)
 *   API reads (GET /api/*)                 → network-first, cache fallback
 *   HTML pages (navigation)                → stale-while-revalidate
 *   Save-Data header                       → aggressive cache, skip non-essentials
 */

const CACHE_NAME = 'halalneo-v2';

// Precache immutable static assets (content-hashed by SvelteKit build)
const STATIC_ASSETS = [
	'/manifest.json',
	'/icons/icon-192.svg',
	'/icons/icon-512.svg',
	'/fonts/space-grotesk/space-grotesk-latin.woff2',
	'/fonts/space-grotesk/space-grotesk-latin-ext.woff2',
	'/fonts/almarai/almarai-400.woff2',
	'/fonts/almarai/almarai-700.woff2'
];

// Offline fallback page — served when both network and cache miss
const OFFLINE_FALLBACK = '/offline';

// Install: precache static assets + offline page
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then(async (cache) => {
			await cache.addAll(STATIC_ASSETS);
			// Best-effort offline page — don't fail install if unavailable
			try { await cache.add(OFFLINE_FALLBACK); } catch { /* install proceeds without it */ }
		})
	);
	self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((keys) =>
			Promise.all(
				keys
					.filter((k) => k !== CACHE_NAME)
					.map((k) => caches.delete(k))
			)
		)
	);
	self.clients.claim();
});

// Fetch handler with strategy routing
self.addEventListener('fetch', (event) => {
	const { request } = event;
	if (request.method !== 'GET') return;

	const url = new URL(request.url);
	const saveData = request.headers.get('Save-Data') === 'on';

	// 1. Static assets → cache-first (immutable)
	if (
		url.pathname.startsWith('/_app/') ||
		url.pathname.startsWith('/fonts/') ||
		url.pathname.startsWith('/icons/') ||
		url.pathname.endsWith('.woff2') ||
		url.pathname.endsWith('.svg')
	) {
		event.respondWith(cacheFirst(request));
		return;
	}

	// 2. API media (images) → cache-first, small immutable payloads
	if (url.pathname.startsWith('/api/media/')) {
		event.respondWith(cacheFirst(request));
		return;
	}

	// 3. API reads → network-first with cache fallback
	if (url.pathname.startsWith('/api/') && request.method === 'GET') {
		event.respondWith(networkFirst(request, { saveData }));
		return;
	}

	// 4. HTML navigation → stale-while-revalidate
	event.respondWith(staleWhileRevalidate(request, { saveData }));
});

// ─── Strategy: cache-first ───────────────────────────────────────────
async function cacheFirst(request) {
	const cached = await caches.match(request);
	if (cached) return cached;

	try {
		const response = await fetch(request);
		if (response && response.status === 200) {
			const cache = await caches.open(CACHE_NAME);
			cache.put(request, response.clone());
		}
		return response;
	} catch {
		return new Response(null, { status: 504, statusText: 'Offline' });
	}
}

// ─── Strategy: network-first ─────────────────────────────────────────
async function networkFirst(request, { saveData } = {}) {
	const timeout = saveData ? 2000 : 5000;
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);

	try {
		const response = await fetch(request, { signal: controller.signal });
		clearTimeout(timeoutId);

		if (response && response.status === 200) {
			const cache = await caches.open(CACHE_NAME);
			cache.put(request, response.clone());
		}
		return response;
	} catch {
		clearTimeout(timeoutId);
		const cached = await caches.match(request);
		if (cached) return cached;
		return offlineResponse(request);
	}
}

// ─── Strategy: stale-while-revalidate ────────────────────────────────
async function staleWhileRevalidate(request, { saveData } = {}) {
	const cache = await caches.open(CACHE_NAME);
	const cached = await cache.match(request);

	const fetchPromise = fetch(request)
		.then((response) => {
			if (response && response.status === 200) {
				cache.put(request, response.clone());
			}
			return response;
		})
		.catch(() => cached);

	// In Save-Data mode, prefer cached immediately without network attempt
	if (saveData && cached) return cached;

	return cached || fetchPromise;
}

// ─── Offline fallback ────────────────────────────────────────────────
async function offlineResponse(request) {
	const accept = request.headers.get('Accept') || '';
	if (accept.includes('text/html')) {
		const offline = await caches.match(OFFLINE_FALLBACK);
		if (offline) return offline;
	}
	return new Response('Offline', {
		status: 503,
		headers: { 'Content-Type': 'text/plain' }
	});
}
