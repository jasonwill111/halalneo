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

	// Cache API keys must be fully-qualified URLs — normalize plain string keys
	let key = rawKey;
	try {
		new URL(rawKey);
	} catch {
		key = `https://cache.halalneo.internal/${encodeURIComponent(rawKey)}`;
	}

	const cache = await getDefaultCache();
	if (!cache) return queryFn();

	const cacheRequest = new Request(key);

	const cached = await cache.match(cacheRequest);
	if (cached) {
		const data = (await cached.json()) as T;
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
			let key = url;
			try {
				new URL(url);
			} catch {
				key = `https://cache.halalneo.internal/${encodeURIComponent(url)}`;
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
