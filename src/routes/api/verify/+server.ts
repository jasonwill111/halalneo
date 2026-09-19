import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { eq, or, sql, and, inArray } from 'drizzle-orm';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import * as schema from '#lib/server/db/schema.js';
import { ftsQuery, ftsSlugs } from '#lib/server/fts.js';
import { cachedQuery, cacheShort } from '#lib/server/cache.js';

/**
 * Verify endpoint — FTS-only, no LIKE fallback.
 *
 * Old behavior: when FTS returned 0 slugs, the code fell through to a LIKE
 * '%term%' full-table scan (3 LIKE terms × 2 tables = up to 6 full scans).
 * Short/stopword queries that can't produce FTS tokens now return empty
 * results instead of burning D1 read-ops on a full-table LIKE.
 *
 * Cost: saves 2-6 D1 reads per no-result query. A search box that's empty
 * of useful tokens simply returns nothing — same UX as "no matches".
 */
export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q')?.trim();
	if (!q) return json({ results: [] });

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const match = ftsQuery(q);
	if (!match) return json({ results: [] });

	try {
		const data = await cachedQuery(
			url.toString(),
			async () => {
				const [pSlugs, sSlugs] = await Promise.all([
					ftsSlugs(db, 'products', match, 20),
					ftsSlugs(db, 'suppliers', match, 20)
				]);

				const [supplierRows, productRows] = await Promise.all([
					db
						.select({
							type: sql<'supplier'>`'supplier'`,
							slug: schema.suppliers.slug,
							name: schema.suppliers.name,
							country: schema.suppliers.country,
							businessType: schema.suppliers.businessType,
							certifications: schema.suppliers.certifications,
							certStatus: sql<string>`'certified'`
						})
						.from(schema.suppliers)
						.where(
							and(
								eq(schema.suppliers.status, 'active'),
								inArray(schema.suppliers.slug, sSlugs)
							)
						)
						.limit(20),
					db
						.select({
							type: sql<'product'>`'product'`,
							slug: schema.products.slug,
							name: schema.products.name,
							category: schema.categories.name,
							supplierName: schema.suppliers.name,
							supplierSlug: schema.suppliers.slug,
							certifications: schema.suppliers.certifications,
							certStatus: schema.products.certStatus
						})
						.from(schema.products)
						.innerJoin(schema.suppliers, eq(schema.products.supplierSlug, schema.suppliers.slug))
						.leftJoin(schema.categories, eq(schema.products.categorySlug, schema.categories.slug))
						.where(
							and(
								eq(schema.products.status, 'active'),
								or(
									inArray(schema.products.slug, pSlugs),
									inArray(schema.products.supplierSlug, sSlugs)
								)
							)
						)
						.limit(20)
				]);

				const all = [...supplierRows, ...productRows].map((r) => ({
					...r,
					certifications: r.certifications
						? (() => {
								try {
									return JSON.parse(r.certifications as string);
								} catch {
									return [];
								}
							})()
						: []
				}));

				return { results: all };
			},
			{ ...cacheShort(), cacheKey: `/api/verify?q=${encodeURIComponent(q)}` }
		);

		return json(data);
	} catch (e: unknown) {
		return json({ error: e instanceof Error ? e.message : 'Search failed' }, { status: 500 });
	}
};
