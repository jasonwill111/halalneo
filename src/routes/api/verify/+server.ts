import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { eq, like, or, sql } from 'drizzle-orm';
import { getDbFromPlatform } from '#lib/server/db/api-helpers.js';
import * as schema from '#lib/server/db/schema.js';
import { cachedQuery, cacheShort } from '#lib/server/cache.js';

export const GET: RequestHandler = async ({ url, platform }) => {
	const q = url.searchParams.get('q')?.trim();
	if (!q) return json({ results: [] });

	const db = getDbFromPlatform(platform);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const term = `%${q}%`;

	try {
		const data = await cachedQuery(
			url.toString(),
			async () => {
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
					or(
						like(schema.suppliers.name, term),
						like(schema.suppliers.certifications, term)
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
					or(
						like(schema.products.name, term),
						like(schema.suppliers.name, term),
						like(schema.suppliers.certifications, term)
					)
				)
				.limit(20)
		]);

				const all = [...supplierRows, ...productRows].map((r) => ({
					...r,
					certifications: r.certifications ? (() => { try { return JSON.parse(r.certifications as string); } catch { return []; } })() : []
				}));

				return { results: all };
			},
			{ ...cacheShort() }
		);

		return json(data);
	} catch (e: any) {
		return json({ error: e?.message ?? 'Search failed' }, { status: 500 });
	}
};
