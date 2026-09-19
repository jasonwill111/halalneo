import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { favorites, products } from '#lib/server/db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { invalidateCache } from '#lib/server/cache.js';
import { getSession } from '#lib/server/auth.js';
import { z } from 'zod';

const favoriteSchema = z.object({ productSlug: z.string().min(1).max(200) });

// ==================== GET ====================
// ?productSlug=<slug> → my favorite state for one product (login).
// (none) → my saved products with display fields (login), newest first.
export const GET: RequestHandler = async (event) => {
	const { url } = event;

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const session = await getSession(event);
	const userId = session?.user.id;
	if (!userId) return json({ error: 'Unauthorized' }, { status: 401 });

	const productSlug = url.searchParams.get('productSlug') || undefined;
	try {
		if (productSlug) {
			const rows = await db
				.select({ productSlug: favorites.productSlug })
				.from(favorites)
				.where(and(eq(favorites.userId, userId), eq(favorites.productSlug, productSlug)))
				.limit(1);
			return json({ favorite: rows.length > 0 });
		}
		const rows = await db
			.select({
				productSlug: favorites.productSlug,
				savedAt: favorites.createdAt,
				name: products.name,
				image: products.image,
				shortDescription: products.shortDescription,
				priceMin: products.priceMin,
				certStatus: products.certStatus,
				originCountry: products.originCountry
			})
			.from(favorites)
			.innerJoin(products, eq(favorites.productSlug, products.slug))
			.where(and(eq(favorites.userId, userId), eq(products.status, 'active')))
			.orderBy(desc(favorites.createdAt))
			.limit(200);
		return json({ items: rows });
	} catch (e: unknown) {
		return json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
	}
};

// ==================== POST: save ====================
export const POST: RequestHandler = async (event) => {
	const { request } = event;
	const session = await getSession(event);
	const userId = session?.user.id;
	if (!userId) return json({ error: 'Please sign in to save products.' }, { status: 401 });

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
	const parsed = favoriteSchema.safeParse(body ?? {});
	if (!parsed.success) return json({ error: 'productSlug is required' }, { status: 400 });

	try {
		const [product] = await db
			.select({ slug: products.slug })
			.from(products)
			.where(and(eq(products.slug, parsed.data.productSlug), eq(products.status, 'active')))
			.limit(1);
		if (!product) return json({ error: 'Product not found' }, { status: 404 });

		await db
			.insert(favorites)
			.values({ userId, productSlug: parsed.data.productSlug, createdAt: new Date() })
			.onConflictDoNothing();
		await invalidateCache('/api/favorites');
		return json({ favorite: true }, { status: 201 });
	} catch (e: unknown) {
		return json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
	}
};

// ==================== DELETE: unsave (?productSlug=) ====================
export const DELETE: RequestHandler = async (event) => {
	const { url } = event;
	const session = await getSession(event);
	const userId = session?.user.id;
	if (!userId) return json({ error: 'Unauthorized' }, { status: 401 });

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const productSlug = url.searchParams.get('productSlug');
	if (!productSlug) return json({ error: 'productSlug is required' }, { status: 400 });

	try {
		await db
			.delete(favorites)
			.where(and(eq(favorites.userId, userId), eq(favorites.productSlug, productSlug)));
		await invalidateCache('/api/favorites');
		return json({ favorite: false });
	} catch (e: unknown) {
		return json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
	}
};
