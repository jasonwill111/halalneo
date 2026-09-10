import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { products } from '#lib/server/db/schema.js';
import { cachedQuery, cacheMedium, invalidateCache, queryCacheKey } from '#lib/server/cache.js';
import { getProductListItems, getProducts } from '#lib/server/queries/index.js';
import { getSession } from '#lib/server/auth.js';

export const GET: RequestHandler = async ({ url }) => {
	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	try {
		// List view: project only the columns the UI needs (10 cols, not all 24).
		// Drops description/features/specifications/faqs/resources/images/videos
		// and other heavy TEXT/JSON fields from D1 rows-read + cache payload.
		const data = await cachedQuery(
			url.toString(),
			async () => {
				const { limit, offset, search } = (() => {
					const n = Math.min(Number(url.searchParams.get('limit')) || 20, 100);
					const o = Number(url.searchParams.get('offset')) || 0;
					return { limit: n, offset: o, search: url.searchParams.get('search') || undefined };
				})();
				return getProductListItems(db, {
					limit,
					offset,
					search,
					categorySlug: url.searchParams.get('categorySlug') || undefined,
					supplierSlug: url.searchParams.get('supplierSlug') || undefined,
					certStatus: url.searchParams.get('certStatus') || undefined,
					status: url.searchParams.get('status') || 'active'
				});
			},
			{ ...cacheMedium(), cacheKey: queryCacheKey(url) }
		);

		return json(data);
	} catch (e: any) {
		return json({ error: e?.message ?? 'Failed' }, { status: 500 });
	}
};

export const POST: RequestHandler = async (event) => {
	const { request } = event;
	const session = await getSession(event);
	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
	if (!body?.slug || !body?.name || !body?.supplierSlug || !body?.categorySlug) {
		return json({ error: 'slug, name, supplierSlug, categorySlug are required' }, { status: 400 });
	}

	try {
		const [row] = await db.insert(products).values(body as any).returning();
		await invalidateCache('/api/products');
		return json(row, { status: 201 });
	} catch (e: any) {
		if (e?.message?.includes('UNIQUE constraint')) {
			return json({ error: 'Product with this slug already exists' }, { status: 409 });
		}
		return json({ error: e?.message ?? 'Internal error' }, { status: 500 });
	}
};
