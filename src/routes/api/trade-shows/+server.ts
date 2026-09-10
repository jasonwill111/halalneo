import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseQuery } from '#lib/server/db/api-helpers.js';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { tradeShows as dbTradeShows } from '#lib/server/db/schema.js';
import { and, eq, like, sql } from 'drizzle-orm';
import { cachedQuery, cacheMedium, invalidateCache, queryCacheKey } from '#lib/server/cache.js';
import { getSession } from '#lib/server/auth.js';
import { tradeShows as staticTradeShows } from '#lib/data/trade-shows.js';

export const GET: RequestHandler = async ({ url }) => {
	const db = getDb(getBindings().DB);
	const { limit, offset, search } = parseQuery(url);
	const status = url.searchParams.get('status') || 'active';
	const scale = url.searchParams.get('scale') || undefined;
	const country = url.searchParams.get('country') || undefined;

	if (!db) {
		let filtered = [...staticTradeShows];
		if (search) filtered = filtered.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
		if (scale) filtered = filtered.filter((s) => s.scale === scale);
		if (country) filtered = filtered.filter((s) => s.country === country);
		// Static entries are curated public content (no status field) — treat
		// as implicitly active; only filter when a non-default status is asked.
		if (status !== 'active') filtered = filtered.filter((s) => (s as any).status === status);
		const total = filtered.length;
		const items = filtered.slice(offset, offset + limit);
		return json({ items, total, limit, offset });
	}

	try {
		const data = await cachedQuery(
			url.toString(),
			async () => {
				const conditions = [];
				if (search) conditions.push(like(dbTradeShows.name, `%${search}%`));
				if (status) conditions.push(eq(dbTradeShows.status, status));
				if (scale) conditions.push(eq(dbTradeShows.scale, scale));
				if (country) conditions.push(eq(dbTradeShows.country, country));

				const where = conditions.length ? and(...conditions) : undefined;

				const [countResult] = await db
					.select({ count: sql<number>`count(*)` })
					.from(dbTradeShows)
					.where(where);

				const rows = await db
					.select()
					.from(dbTradeShows)
					.where(where)
					.limit(limit)
					.offset(offset);

				return { items: rows, total: countResult?.count ?? 0, limit, offset };
			},
			{ ...cacheMedium(), cacheKey: queryCacheKey(url) }
		);

		return json(data);
	} catch {
		let filtered = [...staticTradeShows];
		if (search) filtered = filtered.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
		if (scale) filtered = filtered.filter((s) => s.scale === scale);
		if (country) filtered = filtered.filter((s) => s.country === country);
		if (status !== 'active') filtered = filtered.filter((s) => (s as any).status === status);
		const total = filtered.length;
		const items = filtered.slice(offset, offset + limit);
		return json({ items, total, limit, offset });
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
	if (!body?.id || !body?.name) {
		return json({ error: 'id and name are required' }, { status: 400 });
	}

	try {
		const now = new Date();
		const values = {
			...body,
			createdAt: body.createdAt ? new Date(body.createdAt as string) : now,
			updatedAt: now
		} as any;
		const [row] = await db.insert(dbTradeShows).values(values).returning();
		await invalidateCache('/api/trade-shows');
		return json(row, { status: 201 });
	} catch (e: any) {
		if (e?.message?.includes('UNIQUE constraint')) {
			return json({ error: 'Trade show with this id already exists' }, { status: 409 });
		}
		return json({ error: e?.message ?? 'Internal error' }, { status: 500 });
	}
};
