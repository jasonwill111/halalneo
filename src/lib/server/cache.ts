// D1 query caching using Cloudflare Cache API
// This avoids repeated D1 reads for the same data

interface CacheOptions {
	ttl?: number;
	staleWhileRevalidate?: number;
	cacheKey?: string;
}

declare const caches: CacheStorage;

async function getDefaultCache(): Promise<Cache | null> {
	try {
		// Cloudflare Workers expose caches.default
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return await (caches as any).open('halalneo:d1-cache');
	} catch {
		return null;
	}
}

export async function cachedQuery<T>(
	request: Request | string,
	queryFn: () => Promise<T>,
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

	const cache = await getDefaultCache();
	if (!cache) return queryFn();

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
		const data = (((await cached.json()) as any)) as T;
		return data;
	}

	const data = await queryFn();

	const response = new Response(JSON.stringify(data), {
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': `public, max-age=${ttl}, stale-while-revalidate=${staleWhileRevalidate}`
		}
	});

	try {
		await cache.put(cacheRequest, response.clone());
	} catch {
		// Cache API may not be available in dev
	}

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

export async function invalidateCache(...urls: string[]): Promise<void> {
	const cache = await getDefaultCache();
	if (!cache) return;
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
			return cache.delete(new Request(key));
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
