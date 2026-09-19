import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseQuery } from '#lib/server/db/api-helpers.js';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { certifyingBodies } from '#lib/server/db/schema.js';
import { and, eq, like, sql } from 'drizzle-orm';
import { cachedQuery, cacheLong, invalidateCache, queryCacheKey } from '#lib/server/cache.js';
import { requireAdmin } from '#lib/server/auth-guard.js';
import { certifyingBodyCreateSchema, certifyingBodyStatusSchema } from '#lib/schemas/certifying-bodies.js';

/** Explicit column projection — never SELECT * (§5.9). */
const CB_COLUMNS = {
	id: certifyingBodies.id,
	name: certifyingBodies.name,
	country: certifyingBodies.country,
	standard: certifyingBodies.standard,
	website: certifyingBodies.website,
	description: certifyingBodies.description,
	status: certifyingBodies.status,
	metaTitle: certifyingBodies.metaTitle,
	metaDescription: certifyingBodies.metaDescription,
	keywords: certifyingBodies.keywords,
	createdAt: certifyingBodies.createdAt,
	updatedAt: certifyingBodies.updatedAt
};

export const GET: RequestHandler = async ({ url }) => {
	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	// Early return on a bad filter, before touching D1 or the cache (§5.10).
	const statusResult = certifyingBodyStatusSchema.safeParse(
		url.searchParams.get('status') ?? 'active'
	);
	if (!statusResult.success) {
		return json(
			{ error: "status must be one of 'active', 'pending', 'inactive'" },
			{ status: 400 }
		);
	}
	const status = statusResult.data;

	try {
		const data = await cachedQuery(
			url.toString(),
			async () => {
				// parseQuery clamps limit to <=100 and defaults offset to 0 (§5.9).
				const { limit, offset, search } = parseQuery(url);
				const country = url.searchParams.get('country') || undefined;

				const conditions = [eq(certifyingBodies.status, status)];
				// LIKE only — certifying_bodies_fts does not exist in
				// production D1, and the table is small (<500 rows).
				if (search) conditions.push(like(certifyingBodies.name, `%${search}%`));
				if (country) conditions.push(eq(certifyingBodies.country, country));

				const where = and(...conditions);

				const [countResult] = await db
					.select({ count: sql<number>`count(*)` })
					.from(certifyingBodies)
					.where(where);

				const rows = await db
					.select(CB_COLUMNS)
					.from(certifyingBodies)
					.where(where)
					.limit(limit)
					.offset(offset);

				return { items: rows, total: countResult?.count ?? 0, limit, offset };
			},
			{ ...cacheLong(), cacheKey: queryCacheKey(url) }
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
	const parsed = certifyingBodyCreateSchema.safeParse(body);
	if (!parsed.success) {
		return json(
			{ error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
			{ status: 400 }
		);
	}

	const now = new Date();
	try {
		const [row] = await db
			.insert(certifyingBodies)
			.values({
				// Empty id → let the column's $defaultFn generate a UUID.
				id: parsed.data.id ?? undefined,
				name: parsed.data.name,
				country: parsed.data.country,
				standard: parsed.data.standard ?? null,
				website: parsed.data.website ?? null,
				description: parsed.data.description ?? null,
				status: parsed.data.status ?? 'active',
				metaTitle: parsed.data.metaTitle ?? null,
				metaDescription: parsed.data.metaDescription ?? null,
				keywords: parsed.data.keywords ?? null,
				createdAt: now,
				updatedAt: now
			})
			.returning(CB_COLUMNS);

		await invalidateCache('/api/certifying-bodies');
		return json(row, { status: 201 });
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : '';
		if (message.includes('UNIQUE constraint')) {
			return json({ error: 'A certifying body with this id already exists' }, { status: 409 });
		}
		return json({ error: message || 'Internal error' }, { status: 500 });
	}
};
