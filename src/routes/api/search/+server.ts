import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { or, like, eq, and } from 'drizzle-orm';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import * as schema from '#lib/server/db/schema.js';
import { cachedQuery, cacheShort } from '#lib/server/cache.js';

// Server-side federated search across products, suppliers, knowledge base
// and glossary. Replaces the old client-side pattern (fetch 250 full rows,
// filter in browser). Returns projected columns only, capped per source.
//
// Query-string matters here — explicit cacheKey keeps `?q=halal` separate
// from `?q=beef` (same pattern as /api/verify).
export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q')?.trim();
	if (!q) return json({ products: [], suppliers: [], articles: [], terms: [] });

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const term = `%${q}%`;

	try {
		const data = await cachedQuery(
			url.toString(),
			async () => {
				const [productRows, supplierRows, articleRows, termRows] = await Promise.all([
					db
						.select({
							slug: schema.products.slug,
							name: schema.products.name,
							shortDescription: schema.products.shortDescription,
							categorySlug: schema.products.categorySlug,
							priceMin: schema.products.priceMin,
							originCountry: schema.products.originCountry,
							certStatus: schema.products.certStatus,
							certifications: schema.suppliers.certifications,
							features: schema.products.features
						})
						.from(schema.products)
						.leftJoin(schema.suppliers, eq(schema.products.supplierSlug, schema.suppliers.slug))
						.where(
							or(
								like(schema.products.name, term),
								like(schema.products.shortDescription, term)
							)
						)
						.limit(25),
					db
						.select({
							slug: schema.suppliers.slug,
							name: schema.suppliers.name,
							country: schema.suppliers.country,
							description: schema.suppliers.description,
							certifications: schema.suppliers.certifications
						})
						.from(schema.suppliers)
						.where(
							or(
								like(schema.suppliers.name, term),
								like(schema.suppliers.country, term),
								like(schema.suppliers.description, term)
							)
						)
						.limit(15),
					db
						.select({
							slug: schema.knowledgeBase.slug,
							title: schema.knowledgeBase.title,
							summary: schema.knowledgeBase.summary,
							tags: schema.knowledgeBase.tags,
							section: schema.knowledgeBase.section
						})
						.from(schema.knowledgeBase)
						.where(
							and(
								eq(schema.knowledgeBase.status, 'published'),
								or(
									like(schema.knowledgeBase.title, term),
									like(schema.knowledgeBase.summary, term)
								)
							)
						)
						.limit(15),
					db
						.select({
							title: schema.pages.title,
							body: schema.pages.body,
							excerpt: schema.pages.excerpt
						})
						.from(schema.pages)
						.where(
							and(
								eq(schema.pages.category, 'glossary'),
								or(like(schema.pages.title, term), like(schema.pages.body, term))
							)
						)
						.limit(10)
				]);

				return {
					products: productRows,
					suppliers: supplierRows,
					articles: articleRows,
					terms: termRows.map((t) => ({ term: t.title, definition: t.body ?? t.excerpt ?? '' }))
				};
			},
			{ ...cacheShort(), cacheKey: `/api/search?q=${encodeURIComponent(q)}` }
		);

		return json(data);
	} catch (e: any) {
		return json({ error: e?.message ?? 'Search failed' }, { status: 500 });
	}
};
