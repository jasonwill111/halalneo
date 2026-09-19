// D1 query caching using Cloudflare Cache API
// This avoids repeated D1 reads for the same data

interface CacheOptions {
	ttl?: number;
	staleWhileRevalidate?: number;
	cacheKey?: string;
	queryFn?: () => Promise<unknown>;
}

declare const caches: CacheStorage;

async function getDefaultCache(): Promise<Cache | null> {
	try {
		// Cloudflare Workers expose caches.default plus named caches via open()
		return await caches.open('halalneo:d1-cache');
	} catch {
		return null;
	}
}

/**
 * In-memory LRU cache layered on top of the Cache API.
 * Cloudflare Workers restart often (cold starts); an in-heap Map keyed by
 * cache key avoids the ~1-3ms round-trip to the Cache API on every request
 * within the same Worker instance. Bounded to prevent unbounded growth.
 */
const MAX_IN_MEMORY = 500;
const memoryCache = new Map<string, { value: unknown; expires: number }>();

function memoryGet(key: string): unknown | undefined {
	const entry = memoryCache.get(key);
	if (!entry) return undefined;
	if (Date.now() > entry.expires) {
		memoryCache.delete(key);
		return undefined;
	}
	// Move to end (LRU refresh)
	memoryCache.delete(key);
	memoryCache.set(key, entry);
	return entry.value;
}

function memorySet(key: string, value: unknown, ttlSeconds: number): void {
	if (memoryCache.size >= MAX_IN_MEMORY) {
		// Evict oldest (first entry in Map is LRU)
		const oldestKey = memoryCache.keys().next().value;
		if (oldestKey !== undefined) memoryCache.delete(oldestKey);
	}
	memoryCache.set(key, { value, expires: Date.now() + ttlSeconds * 1000 });
}

export async function cachedQuery<T>(
	request: Request | string,
	queryFn: (() => Promise<T>) | undefined,
	options: CacheOptions = {}
): Promise<T> {
	const { ttl = 300, staleWhileRevalidate = 60, cacheKey } = options;
	const rawKey = cacheKey ?? (typeof request === 'string' ? request : request.url);

	// Cache keys: strip host + query string. Path-only keys match the
	// invalidateCache('/api/products') call site pattern, so writes actually
	// invalidate reads. Endpoints with query-driven cache entries pass an
	// explicit `cacheKey` (e.g. /api/verify?q=halal).
	let key: string;
	if (cacheKey) {
		key = rawKey;
	} else {
		try {
			const u = new URL(rawKey);
			key = u.pathname;
		} catch {
			key = rawKey;
		}
	}
	try {
		new URL(key);
	} catch {
		key = `https://cache.halalneo.internal${key.startsWith('/') ? '' : '/'}${key}`;
	}

	// L1: in-memory fast path (avoids Cache API round-trip on hot keys)
	const memHit = memoryGet(key);
	if (memHit !== undefined) return memHit as T;

	const cache = await getDefaultCache();

	// L2: Cache API
	if (cache) {
		const cacheRequest = new Request(key);
		// NOTE: Cache API can reject synthetic (non-zone) keys in workerd.
		// A failed match must fall through to the live query, never throw.
		let cached: Response | undefined;
		try {
			cached = await cache.match(cacheRequest);
		} catch {
			cached = undefined;
		}
		if (cached) {
			const data = (await cached.json()) as T;
			memorySet(key, data, ttl);
			return data;
		}
	}

	if (!queryFn) return undefined as T;

	const data = await queryFn();

	if (cache) {
		const response = new Response(JSON.stringify(data), {
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': `public, max-age=${ttl}, stale-while-revalidate=${staleWhileRevalidate}`
			}
		});
		try {
			const cacheRequest = new Request(key);
			await cache.put(cacheRequest, response.clone());
		} catch {
			// Cache API may not be available in dev
		}
	}
	memorySet(key, data, ttl);

	return data;
}

export const cacheShort = (ttl = 60): Pick<CacheOptions, 'ttl' | 'staleWhileRevalidate'> => ({
	ttl,
	staleWhileRevalidate: 30
});
export const cacheMedium = (ttl = 300): Pick<CacheOptions, 'ttl' | 'staleWhileRevalidate'> => ({
	ttl,
	staleWhileRevalidate: 60
});
export const cacheLong = (ttl = 3600): Pick<CacheOptions, 'ttl' | 'staleWhileRevalidate'> => ({
	ttl,
	staleWhileRevalidate: 300
});
export const cacheImmutable = (
	ttl = 31536000
): Pick<CacheOptions, 'ttl' | 'staleWhileRevalidate'> => ({
	ttl,
	staleWhileRevalidate: 0
});

/**
 * Query-aware cache key for list endpoints: pathname + sorted params.
 * Bare path-only keys merge `?supplierSlug=a` with `?supplierSlug=b`
 * (first response wins for every filter combo). Use this everywhere
 * the result depends on the query string. Detail routes ([slug]/[id])
 * are path-unique and don't need it.
 * Trade-off: POST invalidation deletes path-only keys, so filtered
 * Cache-API entries can stay stale up to TTL after admin writes
 * (3600s on reference lists like categories/certifying-bodies/pages,
 * 300s medium / 60s short elsewhere); the in-memory layer sweeps
 * `key?…` variants on every invalidate. Correctness first — stale
 * window is bounded.
 */
export function queryCacheKey(url: URL): string {
	const params = new URLSearchParams(url.search);
	params.sort();
	const qs = params.toString();
	return qs ? `${url.pathname}?${qs}` : url.pathname;
}

export async function invalidateCache(...urls: string[]): Promise<void> {
	const cache = await getDefaultCache();
	await Promise.all(
		urls.map((url) => {
			// Match the path-only key scheme used by cachedQuery (without cacheKey).
			let key = url;
			if (!key.startsWith('/')) {
				try {
					const u = new URL(url);
					key = u.pathname;
				} catch {
					// keep as-is
				}
			}
			try {
				new URL(key);
			} catch {
				key = `https://cache.halalneo.internal${key.startsWith('/') ? '' : '/'}${key}`;
			}
			// Also evict the in-memory entry so a stale value doesn't survive
			// the Cache API delete on the next request.
			memoryCache.delete(key);
			// Memory-only sweep of `key?query=…` variants: the Cache API can't
			// list keys, so filtered entries there go stale up to their TTL.
			// Evicting here keeps at least the hot (in-instance) path honest.
			if (!key.includes('?')) {
				const prefix = `${key}?`;
				for (const memKey of memoryCache.keys()) {
					if (memKey.startsWith(prefix)) memoryCache.delete(memKey);
				}
			}
			if (cache) return cache.delete(new Request(key));
			return Promise.resolve();
		})
	);
}

export function purgeCache(basePath: string, slug?: string): Promise<void> {
	const urls = [new URL(basePath, 'https://x').toString()];
	if (slug) {
		urls.push(new URL(`${basePath}/${slug}`, 'https://x').toString());
	}
	return invalidateCache(...urls);
}
