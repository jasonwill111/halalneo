import type { RequestHandler } from './$types';
import { resolve } from '$app/paths';
import { getDbFromPlatform } from '#lib/server/db/api-helpers.js';
import { cachedQuery } from '#lib/server/cache.js';
import {
	getProducts,
	getSuppliers,
	getBlogPosts,
	getCategories,
	getKbArticles,
	getServiceProviders,
	getCertifyingBodies,
	getPages
} from '#lib/server/queries/index.js';
import { marketGuides } from '#lib/data/market-guides.js';

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
	'/search',
	'/verify',
	'/trade-shows',
	'/market-guides',
	'/certifying-bodies',
	'/service-providers',
	'/tools/ingredient-checker',
	'/tools/certification-cost',
	'/tools/ai-chat'
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
	const loc = `${BASE_URL}${resolve(path)}`;
	return `<url>
  <loc>${escapeXml(loc)}</loc>
  <lastmod>${lastmod}</lastmod>
  <changefreq>${changefreq}</changefreq>
  <priority>${priority}</priority>
  <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(loc)}" />
</url>`;
}

export const GET: RequestHandler = async (event) => {
	const db = getDbFromPlatform(event.platform);
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

	// Market guide country pages (static data)
	for (const guide of marketGuides) {
		addEntry(`/market-guides/${guide.slug}`, staticLastmod, 'monthly', '0.7');
	}

	if (db) {
		try {
			const cacheKey = 'sitemap:dynamic-routes';

			const products = await cachedQuery(
				`${cacheKey}:products`,
				() => getProducts(db, { limit: 5000, offset: 0 }),
				{ ttl: 3600, staleWhileRevalidate: 3600 }
			);
			for (const product of products.items) {
				addEntry(`/products/${product.slug}`, product.updatedAt, 'weekly', '0.7');
			}

			const suppliers = await cachedQuery(
				`${cacheKey}:suppliers`,
				() => getSuppliers(db, { limit: 5000, offset: 0 }),
				{ ttl: 3600, staleWhileRevalidate: 3600 }
			);
			for (const supplier of suppliers.items) {
				addEntry(`/suppliers/${supplier.slug}`, supplier.updatedAt, 'weekly', '0.7');
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
				addEntry(`/categories/${category.slug}`, category.updatedAt, 'weekly', '0.7');
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
				addEntry(`/certifying-bodies/${body.slug}`, body.updatedAt, 'monthly', '0.6');
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
