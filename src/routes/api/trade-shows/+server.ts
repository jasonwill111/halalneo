import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDbFromPlatform, parseQuery } from '#lib/server/db/api-helpers.js';
import { tradeShows as dbTradeShows } from '#lib/server/db/schema.js';
import { and, eq, like, sql } from 'drizzle-orm';
import { cachedQuery, cacheMedium } from '#lib/server/cache.js';
import { getSession } from '#lib/server/auth.js';
import { tradeShows as staticTradeShows } from '#lib/data/trade-shows.js';

export const GET: RequestHandler = async ({ platform, url }) => {
	const db = getDbFromPlatform(platform);
	const { limit, offset, search } = parseQuery(url);
	const status = url.searchParams.get('status') || undefined;
	const country = url.searchParams.get('country') || undefined;

	if (!db) {
		let filtered = [...staticTradeShows];
		if (search) filtered = filtered.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
		if (status) filtered = filtered.filter((s) => s.scale === status);
		if (country) filtered = filtered.filter((s) => s.country === country);
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
			{ ...cacheMedium() }
		);

		return json(data);
	} catch {
		let filtered = [...staticTradeShows];
		if (search) filtered = filtered.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
		if (status) filtered = filtered.filter((s) => s.scale === status);
		if (country) filtered = filtered.filter((s) => s.country === country);
		const total = filtered.length;
		const items = filtered.slice(offset, offset + limit);
		return json({ items, total, limit, offset });
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
		return json(row, { status: 201 });
	} catch (e: any) {
		if (e?.message?.includes('UNIQUE constraint')) {
			return json({ error: 'Trade show with this id already exists' }, { status: 409 });
		}
		return json({ error: e?.message ?? 'Internal error' }, { status: 500 });
	}
};
