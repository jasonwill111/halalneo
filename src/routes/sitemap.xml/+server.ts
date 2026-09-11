import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { cachedQuery } from '#lib/server/cache.js';
import { eq } from 'drizzle-orm';
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

export const GET: RequestHandler = async (event) => {
	const db = getDb(getBindings().DB);
	const entries: string[] = [];
	let count = 0;

	const addEntry = (
		path: string,
		lastmod: Date | null | undefined,
		changefreq: string,
		priority: string
	) => {
		if (count >= MAX_URLS) return;
		entries.push(buildUrlEntry(path, formatDate(lastmod), changefreq, priority));
		count++;
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
				() => db.select({ slug: dbMarketGuides.slug, updatedAt: dbMarketGuides.updatedAt }).from(dbMarketGuides),
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
					db
						.select({ id: dbTradeShows.id, updatedAt: dbTradeShows.updatedAt })
						.from(dbTradeShows),
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
					db
						.select({ id: dbRfqs.id, updatedAt: dbRfqs.updatedAt })
						.from(dbRfqs)
						.where(eq(dbRfqs.status, 'active')),
				{ ttl: 3600, staleWhileRevalidate: 3600 }
			);
			for (const r of rfqs) {
				addEntry(`/rfqs/${r.id}`, r.updatedAt, 'daily', '0.6');
			}

			// Promotions (active deals only)
			const promos = await cachedQuery(
				`${cacheKey}:promotions`,
				() =>
					db
						.select({ id: dbPromos.id, updatedAt: dbPromos.updatedAt })
						.from(dbPromos)
						.where(eq(dbPromos.status, 'active')),
				{ ttl: 3600, staleWhileRevalidate: 3600 }
			);
			for (const p of promos) {
				addEntry(`/promotions/${p.id}`, p.updatedAt, 'daily', '0.6');
			}

			// Success stories (published only)
			const stories = await cachedQuery(
				`${cacheKey}:stories`,
				() =>
					db
						.select({ slug: dbStories.slug, updatedAt: dbStories.updatedAt })
						.from(dbStories)
						.where(eq(dbStories.status, 'published')),
				{ ttl: 3600, staleWhileRevalidate: 3600 }
			);
			for (const s of stories) {
				addEntry(`/success-stories/${s.slug}`, s.updatedAt, 'monthly', '0.6');
			}
			const products = await cachedQuery(
				`${cacheKey}:products`,
				() => getProducts(db, { limit: 5000, offset: 0 }),
				{ ttl: 3600, staleWhileRevalidate: 3600 }
			);
			for (const product of products.items) {
				addEntry(`/product/${product.slug}`, product.updatedAt, 'weekly', '0.7');
			}

			const suppliers = await cachedQuery(
				`${cacheKey}:suppliers`,
				() => getSuppliers(db, { limit: 5000, offset: 0 }),
				{ ttl: 3600, staleWhileRevalidate: 3600 }
			);
			for (const supplier of suppliers.items) {
				addEntry(`/supplier/${supplier.slug}`, supplier.updatedAt, 'weekly', '0.7');
			}

			const blogPosts = await cachedQuery(
				`${cacheKey}:blog`,
				() => getBlogPosts(db, { limit: 5000, offset: 0 }),
				{ ttl: 3600, staleWhileRevalidate: 3600 }
			);
			for (const post of blogPosts.items) {
				addEntry(`/blog/${post.slug}`, post.updatedAt ?? post.publishedAt, 'monthly', '0.6');
			}

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
				() => getKbArticles(db, { limit: 5000, offset: 0 }),
				{ ttl: 3600, staleWhileRevalidate: 3600 }
			);
			for (const article of kbArticles.items) {
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
			const seenSections = new Set<string>();
			for (const sec of kbSections) {
				if (seenSections.has(sec.section)) continue;
				seenSections.add(sec.section);
				addEntry(`/knowledge-base/${sec.section}`, new Date('2026-01-01'), 'weekly', '0.7');
			}

			const serviceProviders = await cachedQuery(
				`${cacheKey}:service-providers`,
				() => getServiceProviders(db, { limit: 5000, offset: 0 }),
				{ ttl: 3600, staleWhileRevalidate: 3600 }
			);
			for (const provider of serviceProviders.items) {
				addEntry(`/service-providers/${provider.slug}`, provider.updatedAt, 'monthly', '0.6');
			}

			const certifyingBodies = await cachedQuery(
				`${cacheKey}:certifying-bodies`,
				() => getCertifyingBodies(db, { limit: 5000, offset: 0 }),
				{ ttl: 3600, staleWhileRevalidate: 3600 }
			);
			for (const body of certifyingBodies.items) {
				addEntry(`/certifying-bodies/${body.id}`, body.updatedAt, 'monthly', '0.6');
			}

			const landingPages = await cachedQuery(
				`${cacheKey}:pages`,
				() => getPages(db, { limit: 5000, offset: 0, type: 'landing' }),
				{ ttl: 3600, staleWhileRevalidate: 3600 }
			);
			for (const page of landingPages.items) {
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
