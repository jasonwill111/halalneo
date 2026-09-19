import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { categories } from '#lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { cachedQuery, cacheLong, invalidateCache } from '#lib/server/cache.js';
import { getSession } from '#lib/server/auth.js';
import { requireAdmin } from '#lib/server/auth-guard.js';
import { categoryUpdateSchema } from '#lib/schemas/categories.js';

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

export const GET: RequestHandler = async (event) => {
	const { params, url } = event;
	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	try {
		const row = await cachedQuery(
			url.toString(),
			async () => {
				const [row] = await db
					.select(CATEGORY_COLUMNS)
					.from(categories)
					.where(eq(categories.slug, params.slug))
					.limit(1);
				return row ?? null;
			},
			{ ...cacheLong() }
		);

		if (!row) return json({ error: 'Not found' }, { status: 404 });
		// NOTE: `status` may be absent on rows cached before the 2026-09
		// categories-status migration — treat missing as public (all D1 rows
		// are backfilled 'active'). Never 404 on a missing field.
		if (row.status != null && row.status !== 'active') {
			const session = await getSession(event);
			if (!session) return json({ error: 'Not found' }, { status: 404 });
		}
		return json(row);
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : '';
		return json({ error: message || 'Failed' }, { status: 500 });
	}
};

/**
 * Full-record update (the admin form always submits every editable column).
 * `slug` is the primary key and stays immutable — it is taken from the path.
 */
export const PUT: RequestHandler = async (event) => {
	const { params, request } = event;
	const denied = await requireAdmin(event);
	if (denied) return denied;

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const body: unknown = await request.json().catch(() => null);
	const parsed = categoryUpdateSchema.safeParse(body);
	if (!parsed.success) {
		return json(
			{ error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
			{ status: 400 }
		);
	}
	if (parsed.data.parentSlug && parsed.data.parentSlug === params.slug) {
		return json(
			{ error: 'Validation failed', details: { parentSlug: ['A category cannot be its own parent.'] } },
			{ status: 400 }
		);
	}

	try {
		const [row] = await db
			.update(categories)
			.set({
				name: parsed.data.name,
				description: parsed.data.description ?? null,
				parentSlug: parsed.data.parentSlug ?? null,
				icon: parsed.data.icon ?? null,
				status: parsed.data.status ?? 'active',
				sortOrder: parsed.data.sortOrder ?? 0,
				metaTitle: parsed.data.metaTitle ?? null,
				metaDescription: parsed.data.metaDescription ?? null,
				keywords: parsed.data.keywords ?? null,
				updatedAt: new Date()
			})
			.where(eq(categories.slug, params.slug))
			.returning(CATEGORY_COLUMNS);
		if (!row) return json({ error: 'Not found' }, { status: 404 });
		await invalidateCache('/api/categories', `/api/categories/${params.slug}`);
		return json(row);
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : '';
		return json({ error: message || 'Update failed' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async (event) => {
	const { params } = event;
	const denied = await requireAdmin(event);
	if (denied) return denied;

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	try {
		const [row] = await db
			.delete(categories)
			.where(eq(categories.slug, params.slug))
			.returning({ slug: categories.slug });
		if (!row) return json({ error: 'Not found' }, { status: 404 });

		// Orphaned children become top-level in a single indexed UPDATE
		// (idx_categories_parent) instead of a client-side N+1 loop (§5.9).
		await db
			.update(categories)
			.set({ parentSlug: null, updatedAt: new Date() })
			.where(eq(categories.parentSlug, params.slug));

		await invalidateCache('/api/categories', `/api/categories/${params.slug}`);
		return json({ deleted: true });
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : '';
		return json({ error: message || 'Delete failed' }, { status: 500 });
	}
};
