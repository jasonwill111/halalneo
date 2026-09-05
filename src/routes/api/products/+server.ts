import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDbFromPlatform } from '#lib/server/db/api-helpers.js';
import { products } from '#lib/server/db/schema.js';
import { cachedQuery, cacheMedium, invalidateCache } from '#lib/server/cache.js';
import { getProductListItems, getProducts } from '#lib/server/queries/index.js';
import { getSession } from '#lib/server/auth.js';

export const GET: RequestHandler = async ({ platform, url }) => {
	const db = getDbFromPlatform(platform);
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
					status: url.searchParams.get('status') || undefined
				});
			},
			{ ...cacheMedium() }
		);

		return json(data);
	} catch (e: any) {
		return json({ error: e?.message ?? 'Failed' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, platform }) => {
	const session = await getSession({ platform, request, locals: {} } as any);
	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const db = getDbFromPlatform(platform);
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
