import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseQuery } from '#lib/server/db/api-helpers.js';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { categories } from '#lib/server/db/schema.js';
import { and, asc, eq, like, sql } from 'drizzle-orm';
import { cachedQuery, cacheMedium, invalidateCache, queryCacheKey } from '#lib/server/cache.js';
import { requireAdmin } from '#lib/server/auth-guard.js';
import { categoryCreateSchema, categoryStatusSchema } from '#lib/schemas/categories.js';

/** Explicit column projection — never SELECT * (§5.9). */
const CATEGORY_COLUMNS = {
	slug: categories.slug,
	name: categories.name,
	description: categories.description,
	parentSlug: categories.parentSlug,
	icon: categories.icon,
	status: categories.status,
	sortOrder: categories.sortOrder,
	metaTitle: categories.metaTitle,
	metaDescription: categories.metaDescription,
	keywords: categories.keywords,
	createdAt: categories.createdAt,
	updatedAt: categories.updatedAt
};

export const GET: RequestHandler = async ({ url }) => {
	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	// Early return on a bad filter, before touching D1 or the cache (§5.10).
	const statusResult = categoryStatusSchema.safeParse(
		url.searchParams.get('status') ?? 'active'
	);
	if (!statusResult.success) {
		return json({ error: "status must be 'active' or 'inactive'" }, { status: 400 });
	}
	const status = statusResult.data;

	try {
		const data = await cachedQuery(
			url.toString(),
			async () => {
				// parseQuery clamps limit to <=100 and defaults offset to 0 (§5.9).
				const { limit, offset, search } = parseQuery(url);
				const parentSlug = url.searchParams.get('parentSlug') || undefined;

				const conditions = [eq(categories.status, status)];
				if (search) conditions.push(like(categories.name, `%${search}%`));
				if (parentSlug) conditions.push(eq(categories.parentSlug, parentSlug));
				const where = and(...conditions);

				// Small table (<500 rows, indexed on parent_slug): LIKE scan is bounded.
				const [countResult] = await db
					.select({ count: sql<number>`count(*)` })
					.from(categories)
					.where(where);

				const rows = await db
					.select(CATEGORY_COLUMNS)
					.from(categories)
					.where(where)
					.orderBy(asc(categories.sortOrder), asc(categories.name))
					.limit(limit)
					.offset(offset);

				return { items: rows, total: countResult?.count ?? 0, limit, offset };
			},
			{ ...cacheMedium(), cacheKey: queryCacheKey(url) }
		);

		if (!data) return json({ items: [], total: 0, limit: 0, offset: 0 }, { status: 503 });
		return json(data);
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : '';
		return json({ error: message || 'Failed' }, { status: 500 });
	}
};

export const POST: RequestHandler = async (event) => {
	const denied = await requireAdmin(event);
	if (denied) return denied;

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const body: unknown = await event.request.json().catch(() => null);
	const parsed = categoryCreateSchema.safeParse(body);
	if (!parsed.success) {
		return json(
			{ error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
			{ status: 400 }
		);
	}

	const now = new Date();
	try {
		const [row] = await db
			.insert(categories)
			.values({
				slug: parsed.data.slug,
				name: parsed.data.name,
				description: parsed.data.description ?? null,
				parentSlug: parsed.data.parentSlug ?? null,
				icon: parsed.data.icon ?? null,
				status: parsed.data.status ?? 'active',
				sortOrder: parsed.data.sortOrder ?? 0,
				metaTitle: parsed.data.metaTitle ?? null,
				metaDescription: parsed.data.metaDescription ?? null,
				keywords: parsed.data.keywords ?? null,
				createdAt: now,
				updatedAt: now
			})
			.returning(CATEGORY_COLUMNS);

		await invalidateCache('/api/categories');
		return json(row, { status: 201 });
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : '';
		if (message.includes('UNIQUE constraint')) {
			return json({ error: 'Category with this slug already exists' }, { status: 409 });
		}
		return json({ error: message || 'Internal error' }, { status: 500 });
	}
};
