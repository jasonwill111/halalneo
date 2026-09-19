import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { cachedQuery } from '#lib/server/cache.js';
import { asc, eq } from 'drizzle-orm';
import {
	getProducts,
	getSuppliers,
	getBlogPosts,
	getCategories,
	getKbArticles,
	getKbSections,
	getServiceProviders,
	getCertifyingBodies,
	getPages
} from '#lib/server/queries/index.js';
import { marketGuides as staticMarketGuides } from '#lib/data/market-guides.js';
import {
	marketGuides as dbMarketGuides,
	tradeShows as dbTradeShows,
	buyingRequests as dbRfqs,
	promotions as dbPromos,
	successStories as dbStories
} from '#lib/server/db/schema.js';
import { tradeShows as staticTradeShows } from '#lib/data/trade-shows.js';

const BASE_URL = 'https://halalneo.com';
const MAX_URLS = 5000;
/**
 * §5.9.4: no list query may ask for more than 100 rows. The sitemap needs *all*
 * rows, so it pages with a 100-row stride instead of passing `limit: 5000`.
 */
const SITEMAP_PAGE_SIZE = 100;

/**
 * Collect every row of a list query in ≤100-row pages, stopping on the first
 * short page. Each call is a single indexed D1 read, and the whole result is
 * cached under one key by the caller, so the extra round trips only happen on a
 * cold cache (hourly).
 */
async function pageThrough<T>(
	read: (offset: number) => Promise<T[]>,
	stopAt?: (collected: number) => boolean
): Promise<T[]> {
	const rows: T[] = [];
	for (let offset = 0; ; offset += SITEMAP_PAGE_SIZE) {
		const page = await read(offset);
		rows.push(...page);
		if (page.length < SITEMAP_PAGE_SIZE) return rows;
		if (rows.length >= MAX_URLS) return rows;
		if (stopAt?.(rows.length)) return rows;
	}
}

/** Paged variant of the paginated list helpers in #lib/server/queries. */
async function pageAll<T>(
	run: (opts: { limit: number; offset: number }) => Promise<{ items: T[]; total: number }>
): Promise<T[]> {
	let total = Infinity;
	const rows = await pageThrough(async (offset) => {
		const page = await run({ limit: SITEMAP_PAGE_SIZE, offset });
		total = page.total;
		return page.items;
	}, (collected) => collected >= total);
	return rows;
}

const staticRoutes = [
	'/',
	'/about',
	'/faq',
	'/contact',
	'/pricing',
	'/blog',
	'/categories',
	'/suppliers',
	'/products',
	'/knowledge-base',
	'/glossary',
	'/verify',
	'/trade-shows',
	'/market-guides',
	'/certifying-bodies',
	'/service-providers',
	'/tools',
	'/tools/ingredient-checker',
	'/tools/certification-cost',
	'/tools/landed-cost',
	'/tools/rfq-builder',
	'/tools/ai-chat',
	'/rfqs',
	'/promotions',
	'/success-stories'
];

function formatDate(date: Date | null | undefined): string {
	if (!date) return new Date().toISOString().split('T')[0];
	return date.toISOString().split('T')[0];
}

function escapeXml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

function buildUrlEntry(
	path: string,
	lastmod: string,
	changefreq: string,
	priority: string
): string {
	const loc = `${BASE_URL}${path}`;
	return `<url>
  <loc>${escapeXml(loc)}</loc>
  <lastmod>${lastmod}</lastmod>
  <changefreq>${changefreq}</changefreq>
  <priority>${priority}</priority>
  <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(loc)}" />
  <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(loc)}" />
</url>`;
}

export const GET: RequestHandler = async () => {
	const db = getDb(getBindings().DB);
	const entries: string[] = [];
	const seen = new Set<string>();

	const addEntry = (
		path: string,
		lastmod: Date | null | undefined,
		changefreq: string,
		priority: string
	) => {
		if (entries.length >= MAX_URLS || seen.has(path)) return;
		seen.add(path);
		entries.push(buildUrlEntry(path, formatDate(lastmod), changefreq, priority));
	};

	// Static routes (use fixed date to avoid unnecessary crawls)
	const staticLastmod = new Date('2026-01-01');
	for (const route of staticRoutes) {
		addEntry(route, staticLastmod, route === '/' ? 'daily' : 'weekly', route === '/' ? '1.0' : '0.8');
	}

	// Market guide country pages (static fallback when DB is unavailable)
	for (const guide of staticMarketGuides) {
		addEntry(`/market-guides/${guide.slug}`, staticLastmod, 'monthly', '0.7');
	}

	// Trade show detail pages (static fallback when DB is unavailable)
	for (const show of staticTradeShows) {
		addEntry(`/trade-shows/${show.id}`, staticLastmod, 'monthly', '0.7');
	}

	if (db) {
		try {
			const cacheKey = 'sitemap:dynamic-routes';

			// Market guides from DB (source of truth — includes guides added after seed)
			const dbGuides = await cachedQuery(
				`${cacheKey}:market-guides`,
				() =>
					pageThrough((offset) =>
						db
							.select({ slug: dbMarketGuides.slug, updatedAt: dbMarketGuides.updatedAt })
							.from(dbMarketGuides)
							.orderBy(asc(dbMarketGuides.slug))
							.limit(SITEMAP_PAGE_SIZE)
							.offset(offset)
					),
				{ ttl: 3600, staleWhileRevalidate: 3600 }
			);
			const staticSlugs = new Set(staticMarketGuides.map((g) => g.slug));
			for (const guide of dbGuides) {
				if (staticSlugs.has(guide.slug)) continue;
				addEntry(`/market-guides/${guide.slug}`, guide.updatedAt, 'monthly', '0.7');
			}

			// Trade shows from DB (source of truth — includes shows added after seed)
			const dbShows = await cachedQuery(
				`${cacheKey}:trade-shows`,
				() =>
					pageThrough((offset) =>
						db
							.select({ id: dbTradeShows.id, updatedAt: dbTradeShows.updatedAt })
							.from(dbTradeShows)
							.orderBy(asc(dbTradeShows.id))
							.limit(SITEMAP_PAGE_SIZE)
							.offset(offset)
					),
				{ ttl: 3600, staleWhileRevalidate: 3600 }
			);
			const staticShowIds = new Set(staticTradeShows.map((s) => s.id));
			for (const show of dbShows) {
				if (staticShowIds.has(show.id)) continue;
				addEntry(`/trade-shows/${show.id}`, show.updatedAt, 'monthly', '0.7');
			}

			// Buying requests (public board — active only)
			const rfqs = await cachedQuery(
				`${cacheKey}:rfqs`,
				() =>
					pageThrough((offset) =>
						db
							.select({ id: dbRfqs.id, updatedAt: dbRfqs.updatedAt })
							.from(dbRfqs)
							.where(eq(dbRfqs.status, 'active'))
							.orderBy(asc(dbRfqs.id))
							.limit(SITEMAP_PAGE_SIZE)
							.offset(offset)
					),
				{ ttl: 3600, staleWhileRevalidate: 3600 }
			);
			for (const r of rfqs) {
				addEntry(`/rfqs/${r.id}`, r.updatedAt, 'daily', '0.6');
			}

			// Promotions (active deals only)
			const promos = await cachedQuery(
				`${cacheKey}:promotions`,
				() =>
					pageThrough((offset) =>
						db
							.select({ id: dbPromos.id, updatedAt: dbPromos.updatedAt })
							.from(dbPromos)
							.where(eq(dbPromos.status, 'active'))
							.orderBy(asc(dbPromos.id))
							.limit(SITEMAP_PAGE_SIZE)
							.offset(offset)
					),
				{ ttl: 3600, staleWhileRevalidate: 3600 }
			);
			for (const p of promos) {
				addEntry(`/promotions/${p.id}`, p.updatedAt, 'daily', '0.6');
			}

			// Success stories (published only)
			const stories = await cachedQuery(
				`${cacheKey}:stories`,
				() =>
					pageThrough((offset) =>
						db
							.select({ slug: dbStories.slug, updatedAt: dbStories.updatedAt })
							.from(dbStories)
							.where(eq(dbStories.status, 'published'))
							.orderBy(asc(dbStories.slug))
							.limit(SITEMAP_PAGE_SIZE)
							.offset(offset)
					),
				{ ttl: 3600, staleWhileRevalidate: 3600 }
			);
			for (const s of stories) {
				addEntry(`/success-stories/${s.slug}`, s.updatedAt, 'monthly', '0.6');
			}

			const products = await cachedQuery(
				`${cacheKey}:products`,
				() => pageAll((opts) => getProducts(db, opts)),
				{ ttl: 3600, staleWhileRevalidate: 3600 }
			);
			for (const product of products) {
				addEntry(`/product/${product.slug}`, product.updatedAt, 'weekly', '0.7');
			}

			const suppliers = await cachedQuery(
				`${cacheKey}:suppliers`,
				() => pageAll((opts) => getSuppliers(db, opts)),
				{ ttl: 3600, staleWhileRevalidate: 3600 }
			);
			for (const supplier of suppliers) {
				addEntry(`/supplier/${supplier.slug}`, supplier.updatedAt, 'weekly', '0.7');
			}

			const blogPosts = await cachedQuery(
				`${cacheKey}:blog`,
				() => pageAll((opts) => getBlogPosts(db, opts)),
				{ ttl: 3600, staleWhileRevalidate: 3600 }
			);
			for (const post of blogPosts) {
				addEntry(`/blog/${post.slug}`, post.updatedAt ?? post.publishedAt, 'monthly', '0.6');
			}

			// Categories are capped at the 100-row list limit in the query layer.
			const categories = await cachedQuery(
				`${cacheKey}:categories`,
				() => getCategories(db),
				{ ttl: 3600, staleWhileRevalidate: 3600 }
			);
			for (const category of categories) {
				addEntry(`/category/${category.slug}`, category.updatedAt, 'weekly', '0.7');
			}

			const kbArticles = await cachedQuery(
				`${cacheKey}:kb`,
				() => pageAll((opts) => getKbArticles(db, opts)),
				{ ttl: 3600, staleWhileRevalidate: 3600 }
			);
			for (const article of kbArticles) {
				addEntry(
					`/knowledge-base/${article.section}/${article.slug}`,
					article.updatedAt,
					'monthly',
					'0.6'
				);
			}

			// KB section index pages
			const kbSections = await cachedQuery(
				`${cacheKey}:kb-sections`,
				() => getKbSections(db),
				{ ttl: 3600, staleWhileRevalidate: 3600 }
			);
			for (const sec of kbSections) {
				addEntry(`/knowledge-base/${sec.section}`, new Date('2026-01-01'), 'weekly', '0.7');
			}

			const serviceProviders = await cachedQuery(
				`${cacheKey}:service-providers`,
				() => pageAll((opts) => getServiceProviders(db, opts)),
				{ ttl: 3600, staleWhileRevalidate: 3600 }
			);
			for (const provider of serviceProviders) {
				addEntry(`/service-providers/${provider.slug}`, provider.updatedAt, 'monthly', '0.6');
			}

			const certifyingBodies = await cachedQuery(
				`${cacheKey}:certifying-bodies`,
				() => pageAll((opts) => getCertifyingBodies(db, opts)),
				{ ttl: 3600, staleWhileRevalidate: 3600 }
			);
			for (const body of certifyingBodies) {
				addEntry(`/certifying-bodies/${body.id}`, body.updatedAt, 'monthly', '0.6');
			}

			const landingPages = await cachedQuery(
				`${cacheKey}:pages`,
				() => pageAll((opts) => getPages(db, { ...opts, type: 'landing' })),
				{ ttl: 3600, staleWhileRevalidate: 3600 }
			);
			for (const page of landingPages) {
				addEntry(`/${page.slug}`, page.updatedAt, 'weekly', '0.7');
			}
		} catch (err) {
			console.error('Sitemap: failed to query dynamic routes', err);
		}
	}

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
		}
	});
};
