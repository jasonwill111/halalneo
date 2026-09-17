/**
 * Smart cache wrapper — thin facade over cachedQuery + Cache API invalidation.
 *
 * Previous version imported the broken IntelligentCacheSystem (cache-optimization.ts)
 * which had runtime errors (.val on undefined, wrong D1 API calls, duplicate methods).
 * That code never actually executed — every call fell through to the cachedQuery fallback.
 *
 * This rewrite makes the working path the ONLY path: cachedQuery for reads,
 * invalidateCache for writes. No dead code, no broken abstractions.
 */

import { cachedQuery, cacheMedium, invalidateCache, queryCacheKey } from '#lib/server/cache.js';

interface CacheStrategy {
	ttl: number;
	staleWhileRevalidate?: number;
	priority?: 'high' | 'medium' | 'low';
	cacheKey?: string | URL;
}

/**
 * Cached query — delegates to Cloudflare Cache API via cachedQuery.
 * @param cacheKeyOrUrl  URL object or string cache key
 * @param queryFn        Data-fetching function (called on cache miss)
 * @param strategy       TTL + optional explicit cache key
 */
export async function smartQuery<T>(
	cacheKeyOrUrl: string | URL,
	queryFn: () => Promise<T>,
	strategy: CacheStrategy = { ttl: 3600 }
): Promise<T> {
	const key =
		typeof cacheKeyOrUrl === 'string'
			? cacheKeyOrUrl
			: strategy.cacheKey
				? queryCacheKey(cacheKeyOrUrl as unknown as URL)
				: cacheKeyOrUrl.toString();

	return cachedQuery(key, queryFn, {
		ttl: strategy.ttl,
		staleWhileRevalidate: strategy.staleWhileRevalidate ?? Math.floor(strategy.ttl / 6),
		cacheKey: key
	});
}

/**
 * Invalidate cached entries matching the given URL patterns.
 * Walks the Cloudflare Cache API and deletes path-only keys.
 */
export async function smartInvalidate(...patterns: string[]): Promise<void> {
	await invalidateCache(...patterns);
}

export { queryCacheKey, cacheMedium };
