import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDbFromPlatform } from '#lib/server/db/api-helpers.js';
import { tradeShows } from '#lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { cachedQuery, cacheLong, invalidateCache } from '#lib/server/cache.js';
import { getShowById } from '#lib/data/trade-shows.js';
import { getSession } from '#lib/server/auth.js';

const ALLOWED_TS_FIELDS = new Set([
	'name', 'city', 'country', 'region', 'startDate', 'endDate',
	'venue', 'website', 'scale', 'description', 'focus',
	'exhibitors', 'visitors', 'metaTitle', 'metaDescription', 'keywords', 'status'
]);

export const GET: RequestHandler = async ({ params, url, platform }) => {
	const db = getDbFromPlatform(platform);

	if (!db) {
		const row = getShowById(params.id);
		if (!row) return json({ error: 'Not found' }, { status: 404 });
		return json(row);
	}

	try {
		const row = await cachedQuery(
			url.toString(),
			async () => {
				const [row] = await db.select().from(tradeShows).where(eq(tradeShows.id, params.id)).limit(1);
				return row ?? null;
			},
			{ ...cacheLong() }
		);

		if (!row) {
			const fallback = getShowById(params.id);
			if (!fallback) return json({ error: 'Not found' }, { status: 404 });
			return json(fallback);
		}
		return json(row);
	} catch {
		const row = getShowById(params.id);
		if (!row) return json({ error: 'Not found' }, { status: 404 });
		return json(row);
	}
};

export const PUT: RequestHandler = async ({ params, request, platform }) => {
	const session = await getSession({ platform, request, locals: {} } as any);
	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const db = getDbFromPlatform(platform);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const body = (((await request.json()) as any).catch(() => null)) as Record<string, unknown> | null;
	if (!body) return json({ error: 'Invalid body' }, { status: 400 });

	const { id: _id, ...rawUpdates } = body;
	const updates: Record<string, unknown> = {};
	for (const [k, v] of Object.entries(rawUpdates)) {
		if (ALLOWED_TS_FIELDS.has(k)) updates[k] = v;
	}
	updates.updatedAt = new Date();

	try {
		const [row] = await db
			.update(tradeShows)
			.set(updates as any)
			.where(eq(tradeShows.id, params.id))
			.returning();
		if (!row) return json({ error: 'Not found' }, { status: 404 });
		await invalidateCache('/api/trade-shows', `/api/trade-shows/${params.id}`);
		return json(row);
	} catch (e: any) {
		return json({ error: e?.message ?? 'Update failed' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params, request, platform }) => {
	const session = await getSession({ platform, request, locals: {} } as any);
	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const db = getDbFromPlatform(platform);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	try {
		const [row] = await db
			.delete(tradeShows)
			.where(eq(tradeShows.id, params.id))
			.returning();
		if (!row) return json({ error: 'Not found' }, { status: 404 });
		await invalidateCache('/api/trade-shows', `/api/trade-shows/${params.id}`);
		return json({ deleted: true });
	} catch (e: any) {
		return json({ error: e?.message ?? 'Delete failed' }, { status: 500 });
	}
};
