import { sequence, type Handle } from '@sveltejs/kit/hooks';
import { building } from '$app/env';
import { createAuth } from '#lib/server/auth.js';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { getTextDirection } from '#lib/paraglide/runtime.js';
import { paraglideMiddleware } from '#lib/paraglide/server.js';

// Cache auth instance to avoid recreating on every request (~5-20ms saved per request)
let cachedAuth: ReturnType<typeof createAuth> | null = null;
let cachedDb: any = null;
function getOrCreateAuth(db: any) {
	if (cachedDb === db && cachedAuth) return cachedAuth;
	cachedDb = db;
	cachedAuth = createAuth(db);
	return cachedAuth;
}

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
		pathname.startsWith('/icons/') ||
		pathname === '/manifest.json' ||
		pathname === '/sw.js' ||
		pathname === '/favicon.svg' ||
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
	if (pathname.startsWith('/api') && event.request.method !== 'GET') {
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
		pathname.startsWith('/api/market-guides') ||
		pathname.startsWith('/api/inquiries')
	) {
		const response = await resolve(event);
		response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=60');
		return response;
	}

	// Verify search API — query-dependent, short shared cache
	if (pathname.startsWith('/api/verify')) {
		const response = await resolve(event);
		response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=60');
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

	// Search page — short cache, user-facing filters
	if (pathname === '/search') {
		const response = await resolve(event);
		response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=60');
		return response;
	}

	// Frequently-updating listing pages — moderate shared cache
	if (
		pathname === '/products' ||
		pathname === '/suppliers' ||
		pathname === '/categories' ||
		pathname === '/blog' ||
		pathname === '/trade-shows' ||
		pathname.startsWith('/categories/') ||
		pathname.startsWith('/blog/')
	) {
		const response = await resolve(event);
		response.headers.set('Cache-Control', 'public, max-age=600, s-maxage=3600, stale-while-revalidate=600');
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
		response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=3600');
		return response;
	}

	// Tools pages — static UI, long cache
	if (pathname.startsWith('/tools/')) {
		const response = await resolve(event);
		response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=3600');
		return response;
	}

	// Product/supplier detail — long-tail content
	if (pathname.startsWith('/products/') || pathname.startsWith('/suppliers/')) {
		const response = await resolve(event);
		response.headers.set('Cache-Control', 'public, max-age=600, s-maxage=3600, stale-while-revalidate=600');
		return response;
	}

	// Verify page — short (data freshness matters)
	if (pathname === '/verify') {
		const response = await resolve(event);
		response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=300');
		return response;
	}

	// Homepage — moderate cache
	if (pathname === '/') {
		const response = await resolve(event);
		response.headers.set('Cache-Control', 'public, max-age=600, s-maxage=1800, stale-while-revalidate=600');
		return response;
	}

	// Fallback
	const response = await resolve(event);
	response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=60');
	return response;
};

const PUBLIC_PATHS = [
	'/_app/',
	'/fonts/',
	'/images/',
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
	'/tools',
	'/login',
	'/register'
];

function isPublicPath(pathname: string): boolean {
	if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return true;
	if (PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))) return true;
	return false;
}

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	if (building) return resolve(event);

	const db = event.platform?.env?.DB;
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

	// Admin route protection: require authenticated session
	if (pathname.startsWith('/admin') && !session) {
		return new Response(null, {
			status: 302,
			headers: { Location: '/login' }
		});
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

export const handle: Handle = sequence(
	handleParaglide,
	handleCacheHeaders,
	handleSecurityHeaders,
	handleBetterAuth
);
