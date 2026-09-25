import { sequence, type Handle } from '@sveltejs/kit/hooks';
import { building, dev } from '$app/env';
import { createAuth } from '#lib/server/auth.js';
import { getBindings } from '#lib/server/bindings.js';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { getTextDirection } from '#lib/paraglide/runtime.js';
import { paraglideMiddleware } from '#lib/paraglide/server.js';

// Cloudflare Workers exposes the Cache API globally; no workers-types in tsconfig.
declare const caches: CacheStorage;

// Cache auth instance to avoid recreating on every request (~5-20ms saved per request)
let cachedAuth: ReturnType<typeof createAuth> | null = null;
let cachedDb: D1Database | null = null;
function getOrCreateAuth(db: D1Database) {
	if (cachedDb === db && cachedAuth) return cachedAuth;
	cachedDb = db;
	cachedAuth = createAuth(db);
	return cachedAuth;
}

// Detect Save-Data / low-bandwidth hint from the browser.
// Passes to event.locals so pages/SSR can skip heavy assets.
const handleNetworkHint: Handle = async ({ event, resolve }) => {
	const saveData = event.request.headers.get('Save-Data') === 'on';
	const ect = event.request.headers.get('ECT'); // effective connection type: slow-2g|2g|3g|4g
	const downlink = event.request.headers.get('Downlink'); // Mbps estimate
	const isLowBandwidth = Boolean(
		saveData || ect === 'slow-2g' || ect === '2g' || (downlink && parseFloat(downlink) < 1.5)
	);

	event.locals.saveData = saveData;
	event.locals.ect = ect;
	event.locals.isLowBandwidth = isLowBandwidth;

	const response = await resolve(event);

	// Signal Save-Data mode to downstream caches (Cache API, CDN)
	if (saveData) {
		response.headers.set('Save-Data', 'on');
	}

	return response;
};

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		// Kit 3 made `event.request` readonly; redefine it in place rather than
		// passing a clone —kit's tracing layer spreads own enumerable props,
		// so a clone loses `route`/`url` and prerendering crashes.
		Object.defineProperty(event, 'request', {
			value: request,
			writable: true,
			enumerable: true,
			configurable: true
		});

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace('%paraglide.lang%', locale)
					.replace('%paraglide.dir%', getTextDirection(locale))
		});
	});

const handleSecurityHeaders: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	// Security headers
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-XSS-Protection', '1; mode=block');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set(
		'Permissions-Policy',
		'camera=(), microphone=(), geolocation=(), interest-cohort=()'
	);

	return response;
};

/**
 * Content APIs that serve an admin overview through `?status=all` (draft +
 * archived rows included). Those responses are session-scoped, so they must
 * never pick up the public cache directives applied further down this handler.
 */
const ADMIN_SCOPED_STATUS_APIS = [
	'/api/success-stories',
	'/api/blog',
	'/api/glossary',
	'/api/knowledge-base',
	'/api/market-guides',
	'/api/trade-shows',
	'/api/pages',
	'/api/ai-tools'
];

const handleCacheHeaders: Handle = async ({ event, resolve }) => {
	// Strip locale prefix (e.g. /en/products → /products) so cache rules match
	const rawPathname = event.url.pathname;
	const pathname = rawPathname.replace(/^\/[a-z]{2}(?=\/|$)/, '') || rawPathname;

	// Auth pages — no cache
	if (
		pathname === '/login' ||
		pathname === '/register' ||
		pathname.startsWith('/account') ||
		pathname.startsWith('/supplier')
	) {
		const response = await resolve(event);
		response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
		response.headers.set('Pragma', 'no-cache');
		response.headers.set('Expires', '0');
		return response;
	}

	// Admin pages — no cache
	if (pathname.startsWith('/admin')) {
		const response = await resolve(event);
		response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
		response.headers.set('Pragma', 'no-cache');
		response.headers.set('Expires', '0');
		return response;
	}

	// Static assets — content-hashed, cache forever
	if (
		pathname.startsWith('/_app/') ||
		pathname.startsWith('/fonts/') ||
		pathname.startsWith('/brand/') ||
		pathname === '/manifest.json' ||
		pathname === '/sw.js' ||
		pathname === '/robots.txt'
	) {
		const response = await resolve(event);
		response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
		return response;
	}

	// OG images — long cache
	if (pathname.startsWith('/og-')) {
		const response = await resolve(event);
		response.headers.set('Cache-Control', 'public, max-age=604800');
		return response;
	}

	// Write API endpoints — no cache (POST/PUT/DELETE)
	// Auth endpoints — never cache (session responses are per-user)
	// Session-scoped GETs — never cache (responses differ per user; edge
	// cache is anonymous-shared, so a public directive here would leak one
	// user's private data to everyone hitting the same URL).
	if (
		pathname.startsWith('/api/auth') ||
		(pathname.startsWith('/api') && event.request.method !== 'GET') ||
		pathname.startsWith('/api/inquiries') ||
		pathname.startsWith('/api/supplier-applications') ||
		pathname.startsWith('/api/follows') ||
		pathname.startsWith('/api/favorites') ||
		pathname.startsWith('/api/supplier-memberships') ||
		pathname.startsWith('/api/views') ||
		(ADMIN_SCOPED_STATUS_APIS.some((prefix) => pathname.startsWith(prefix)) &&
			event.url.searchParams.get('status') === 'all')
	) {
		const response = await resolve(event);
		response.headers.set('Cache-Control', 'no-store');
		return response;
	}

	// Public read-only API endpoints — edge cache (Cloudflare Cache API)
	if (
		pathname.startsWith('/api/products') ||
		pathname.startsWith('/api/suppliers') ||
		pathname.startsWith('/api/categories') ||
		pathname.startsWith('/api/blog') ||
		pathname.startsWith('/api/knowledge-base') ||
		pathname.startsWith('/api/certifying-bodies') ||
		pathname.startsWith('/api/service-providers') ||
		pathname.startsWith('/api/settings') ||
		pathname.startsWith('/api/pages') ||
		pathname.startsWith('/api/trade-shows') ||
		pathname.startsWith('/api/market-guides')
	) {
		const response = await resolve(event);
		response.headers.set(
			'Cache-Control',
			'public, max-age=60, s-maxage=300, stale-while-revalidate=60'
		);
		return response;
	}

	// Verify search API — query-dependent, short shared cache
	if (pathname.startsWith('/api/verify') || pathname.startsWith('/api/search')) {
		const response = await resolve(event);
		response.headers.set(
			'Cache-Control',
			'public, max-age=60, s-maxage=120, stale-while-revalidate=60'
		);
		return response;
	}

	// Marketplace public boards — short shared cache (high churn content)
	if (
		pathname.startsWith('/api/rfqs') ||
		pathname.startsWith('/api/promotions') ||
		pathname.startsWith('/api/success-stories')
	) {
		const response = await resolve(event);
		response.headers.set(
			'Cache-Control',
			'public, max-age=60, s-maxage=300, stale-while-revalidate=60'
		);
		return response;
	}

	// Media API — immutable (R2 assets)
	if (pathname.startsWith('/api/media') && event.request.method === 'GET') {
		const response = await resolve(event);
		response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
		return response;
	}

	// Chat API (AI) — never cache
	if (pathname.startsWith('/api/chat')) {
		const response = await resolve(event);
		response.headers.set('Cache-Control', 'no-store');
		return response;
	}

	// llms.txt — the route handler publishes its own long-lived directive;
	// don't let the fallback tiers below override it.
	if (pathname === '/llms.txt') {
		return resolve(event);
	}

	// Search page — short cache, user-facing filters
	if (pathname === '/search') {
		const response = await resolve(event);
		response.headers.set(
			'Cache-Control',
			'public, max-age=300, s-maxage=300, stale-while-revalidate=60'
		);
		return response;
	}

	// Frequently-updating listing pages — moderate shared cache.
	// NOTE: s-maxage intentionally matches the worker Cache-API TTL (300s).
	// A longer edge TTL would serve data the worker layer already considers
	// stale for ~an hour after admin writes (invalidation only deletes
	// path-only worker keys; edge has no purge path from the worker).
	if (
		pathname === '/products' ||
		pathname === '/suppliers' ||
		pathname === '/categories' ||
		pathname === '/blog' ||
		pathname === '/trade-shows' ||
		pathname === '/rfqs' ||
		pathname === '/promotions' ||
		pathname === '/success-stories' ||
		pathname.startsWith('/categories/') ||
		pathname.startsWith('/blog/')
	) {
		const response = await resolve(event);
		response.headers.set(
			'Cache-Control',
			'public, max-age=600, s-maxage=300, stale-while-revalidate=600'
		);
		return response;
	}

	// Reference content — long shared cache
	if (
		pathname.startsWith('/knowledge-base') ||
		pathname.startsWith('/market-guides') ||
		pathname.startsWith('/certifying-bodies') ||
		pathname.startsWith('/service-providers') ||
		pathname === '/glossary' ||
		pathname === '/faq' ||
		pathname === '/about' ||
		pathname === '/contact' ||
		pathname === '/pricing'
	) {
		const response = await resolve(event);
		response.headers.set(
			'Cache-Control',
			'public, max-age=3600, s-maxage=86400, stale-while-revalidate=3600'
		);
		return response;
	}

	// Tools pages — static UI, long cache.
	// Exception: the Ingredient Checker SSRs a sign-in gate from the session,
	// so its HTML differs per user. A shared (s-maxage) copy at the edge would
	// serve the anonymous gate to signed-in browsers — the cache key does not
	// vary by Cookie. Must stay private.
	if (
		pathname === '/tools/ingredient-checker' ||
		pathname.startsWith('/tools/ingredient-checker/')
	) {
		const response = await resolve(event);
		response.headers.set('Cache-Control', 'private, no-store, must-revalidate');
		return response;
	}
	if (pathname.startsWith('/tools/')) {
		const response = await resolve(event);
		response.headers.set(
			'Cache-Control',
			'public, max-age=3600, s-maxage=86400, stale-while-revalidate=3600'
		);
		return response;
	}

	// Product/supplier detail — long-tail content
	if (
		pathname.startsWith('/products/') ||
		pathname.startsWith('/suppliers/') ||
		pathname.startsWith('/rfqs/') ||
		pathname.startsWith('/promotions/') ||
		pathname.startsWith('/success-stories/')
	) {
		const response = await resolve(event);
		response.headers.set(
			'Cache-Control',
			'public, max-age=600, s-maxage=3600, stale-while-revalidate=600'
		);
		return response;
	}

	// Verify page — short (data freshness matters)
	if (pathname === '/verify') {
		const response = await resolve(event);
		response.headers.set(
			'Cache-Control',
			'public, max-age=300, s-maxage=600, stale-while-revalidate=300'
		);
		return response;
	}

	// Homepage — moderate cache
	if (pathname === '/') {
		const response = await resolve(event);
		response.headers.set(
			'Cache-Control',
			'public, max-age=600, s-maxage=1800, stale-while-revalidate=600'
		);
		return response;
	}

	// Fallback
	const response = await resolve(event);
	response.headers.set(
		'Cache-Control',
		'public, max-age=300, s-maxage=600, stale-while-revalidate=60'
	);
	return response;
};

/**
 * Worker-level shared cache for public HTML (Cache API, `caches.open`).
 * Without a Cloudflare Cache Rule the edge never caches Worker responses, so
 * this is the only layer that lets a repeat pageview skip SSR entirely
 * (auth + page load + /api subrequests). Policy mirrors handleCacheHeaders:
 * anonymous GET requests only (a Cookie header always re-renders), no query
 * string, whitelisted public paths, 200 + text/html responses. Entries keep
 * the headers the full handle chain produced (security + Cache-Control), so
 * staleness after admin writes is bounded by the same TTLs we already
 * publish via s-maxage (cap 3600s here, down from the declared 86400).
 */
const HTML_CACHE_ROOTS = new Set([
	'/',
	'/products',
	'/suppliers',
	'/categories',
	'/blog',
	'/knowledge-base',
	'/market-guides',
	'/certifying-bodies',
	'/service-providers',
	'/glossary',
	'/faq',
	'/about',
	'/contact',
	'/pricing',
	'/search',
	'/trade-shows',
	'/rfqs',
	'/promotions',
	'/success-stories',
	'/verify',
	'/tools'
]);

const HTML_CACHE_PREFIXES = [
	'/categories/',
	'/blog/',
	'/knowledge-base/',
	'/market-guides/',
	'/certifying-bodies/',
	'/service-providers/',
	'/products/',
	'/suppliers/',
	'/rfqs/',
	'/promotions/',
	'/success-stories/',
	'/tools/'
];

function isHtmlCacheable(pathname: string): boolean {
	if (pathname.endsWith('__data.json') || pathname.includes('/_/')) return false;
	// Session-dependent SSR page (sign-in gate) — see handleCacheHeaders.
	if (pathname === '/tools/ingredient-checker' || pathname.startsWith('/tools/ingredient-checker/'))
		return false;
	if (HTML_CACHE_ROOTS.has(pathname)) return true;
	return HTML_CACHE_PREFIXES.some((p) => pathname.startsWith(p));
}

function htmlCacheTtl(pathname: string): number {
	if (pathname === '/') return 1800;
	const reference =
		pathname.startsWith('/knowledge-base') ||
		pathname.startsWith('/market-guides') ||
		pathname.startsWith('/certifying-bodies') ||
		pathname.startsWith('/service-providers') ||
		pathname === '/glossary' ||
		pathname === '/faq' ||
		pathname === '/about' ||
		pathname === '/contact' ||
		pathname === '/pricing' ||
		pathname.startsWith('/tools') ||
		pathname.startsWith('/products/') ||
		pathname.startsWith('/suppliers/') ||
		pathname.startsWith('/rfqs/') ||
		pathname.startsWith('/promotions/') ||
		pathname.startsWith('/success-stories/');
	if (reference) return 3600;
	return 300;
}

const handleHtmlCache: Handle = async ({ event, resolve }) => {
	if (building || dev) return resolve(event);
	if (event.request.method !== 'GET') return resolve(event);
	// Any request that carries cookies (session, theme, analytics) renders live,
	// so the shared cache only ever stores the anonymous view.
	if (event.request.headers.has('cookie')) return resolve(event);
	// Query-string views (filters, ?page=, search) render live too.
	if (event.url.search) return resolve(event);

	const stripped = event.url.pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '') || event.url.pathname;
	if (!isHtmlCacheable(stripped)) return resolve(event);

	let cache: Cache | null = null;
	try {
		cache = await caches.open('halalneo:html-cache');
	} catch {
		// Cache API unavailable (non-Workers runtime) — render live every time
	}

	// Real incoming URL as key (workers.dev and halalneo.com get separate
	// entries, which is fine — each colo only serves its own traffic).
	const cacheRequest = new Request(event.url, { method: 'GET' });
	if (cache) {
		let hit: Response | undefined;
		try {
			hit = await cache.match(cacheRequest);
		} catch {
			hit = undefined;
		}
		if (hit) {
			// cache.match() responses have immutable headers — return as-is;
			// the stored copy already carries X-Html-Cache: HIT.
			return hit;
		}
	}

	const response = await resolve(event);
	if (
		cache &&
		response.status === 200 &&
		response.headers.get('Content-Type')?.includes('text/html')
	) {
		const ttl = htmlCacheTtl(stripped);
		response.headers.set(
			'Cache-Control',
			`public, max-age=600, s-maxage=${ttl}, stale-while-revalidate=60`
		);
		const clone = response.clone();
		// Re-serialize with the aligned Cache-Control so a HIT serves the same
		// headers, plus the HIT marker baked in (matched responses are immutable).
		const storedHeaders = new Headers(clone.headers);
		storedHeaders.set('X-Html-Cache', 'HIT');
		const stored = new Response(clone.body, { status: clone.status, headers: storedHeaders });
		// Awaited inline, NOT waitUntil: with waitUntil the put never persisted
		// in workerd (the streamed body dies with the response — verified in
		// prod tail: the put callback never fired). MISS requests pay one
		// extra Cache-API round-trip; every later request in the colo is served
		// from cache.
		try {
			await cache.put(cacheRequest, stored);
		} catch {
			// put can reject on runtime quirks — serve live anyway
		}
		response.headers.set('X-Html-Cache', 'MISS');
	}
	return response;
};

const PUBLIC_PATHS = [
	'/_app/',
	'/fonts/',
	'/icons/',
	'/api/products',
	'/api/suppliers',
	'/api/categories',
	'/api/blog',
	'/api/knowledge-base',
	'/api/certifying-bodies',
	'/api/service-providers',
	'/api/settings',
	'/api/pages',
	'/api/verify',
	'/api/media',
	'/api/trade-shows',
	'/api/market-guides',
	'/api/inquiries'
];

const PUBLIC_ROUTES = [
	'/',
	'/products',
	'/suppliers',
	'/categories',
	'/knowledge-base',
	'/blog',
	'/faq',
	'/about',
	'/contact',
	'/glossary',
	'/pricing',
	'/search',
	'/certifying-bodies',
	'/service-providers',
	'/verify',
	'/trade-shows',
	'/market-guides',
	'/login',
	'/register',
	'/supplier/login',
	'/supplier/register',
	'/supplier/onboarding'
];

function isPublicPath(pathname: string): boolean {
	if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return true;
	if (PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))) return true;
	return false;
}

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	if (building) return resolve(event);

	let db: D1Database | null;
	try {
		db = getBindings().DB;
	} catch {
		db = null;
	}
	if (!db) return resolve(event);

	// Strip locale prefix for auth checks (e.g. /en/admin → /admin)
	const pathname = event.url.pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '') || event.url.pathname;
	if (isPublicPath(pathname)) return resolve(event);

	event.locals.auth = getOrCreateAuth(db);

	const { auth } = event.locals;
	const session = await auth.api.getSession({ headers: event.request.headers });

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	// Admin route protection: require an authenticated session whose email is
	// on the ADMIN_EMAILS allowlist (comma-separated, set as a worker secret).
	// The admin login page itself stays reachable without a session.
	const isAdminLogin = pathname === '/admin/login' || pathname.startsWith('/admin/login/');
	if (pathname.startsWith('/admin') && !isAdminLogin) {
		let allowlist: string[];
		try {
			allowlist = ((getBindings().ADMIN_EMAILS as string | undefined) ?? '')
				.split(',')
				.map((s) => s.trim().toLowerCase())
				.filter(Boolean);
		} catch {
			allowlist = [];
		}
		const email = (session?.user?.email ?? '').toLowerCase();
		if (!session || !email || !allowlist.includes(email)) {
			return new Response(null, {
				status: 302,
				headers: { Location: '/admin/login' }
			});
		}
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

export const handle: Handle = sequence(
	handleHtmlCache,
	handleParaglide,
	handleNetworkHint,
	handleCacheHeaders,
	handleSecurityHeaders,
	handleBetterAuth
);
