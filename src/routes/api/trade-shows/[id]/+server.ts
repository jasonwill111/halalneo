import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { tradeShows } from '#lib/server/db/schema.js';
import { tradeShowColumns } from '#lib/server/db/projections.js';
import { eq } from 'drizzle-orm';
import { cachedQuery, cacheLong, invalidateCache } from '#lib/server/cache.js';
import { getSession } from '#lib/server/auth.js';
import { requireAdmin } from '#lib/server/auth-guard.js';
import { tradeShowUpdateSchema } from '#lib/schemas/trade-shows.js';
import { getShowById } from '#lib/data/trade-shows.js';

export const GET: RequestHandler = async (event) => {
	const { params, url } = event;
	const db = getDb(getBindings().DB);

	if (!db) {
		const row = getShowById(params.id);
		if (!row) return json({ error: 'Not found' }, { status: 404 });
		return json(row);
	}

	try {
		// Visibility guard: static fallback entries are curated public content;
		// non-active DB rows resolve for authenticated sessions only, and are
		// never edge-cached.
		const [row] = await db
			.select(tradeShowColumns)
			.from(tradeShows)
			.where(eq(tradeShows.id, params.id))
			.limit(1);

		if (!row) {
			const fallback = getShowById(params.id);
			if (!fallback) return json({ error: 'Not found' }, { status: 404 });
			return json(fallback);
		}

		if (row.status !== 'active') {
			const session = await getSession(event);
			if (!session) return json({ error: 'Not found' }, { status: 404 });
			return json(row, { headers: { 'Cache-Control': 'private, no-store' } });
		}

		const cached = await cachedQuery(url.toString(), async () => row ?? null, { ...cacheLong() });

		if (!cached) return json({ error: 'Not found' }, { status: 404 });
		return json(cached);
	} catch {
		const row = getShowById(params.id);
		if (!row) return json({ error: 'Not found' }, { status: 404 });
		return json(row);
	}
};

export const PUT: RequestHandler = async (event) => {
	const { params } = event;
	const denied = await requireAdmin(event);
	if (denied) return denied;

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const body = (await event.request.json().catch(() => null)) as unknown;
	if (!body) return json({ error: 'Request body is required' }, { status: 400 });

	const parsed = tradeShowUpdateSchema.safeParse(body);
	if (!parsed.success) {
		return json(
			{ error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
			{ status: 400 }
		);
	}

	const data = parsed.data;
	const set: Partial<typeof tradeShows.$inferInsert> = { updatedAt: new Date() };

	if (data.name !== undefined) set.name = data.name;
	if (data.city !== undefined) set.city = data.city ?? '';
	if (data.country !== undefined) set.country = data.country ?? '';
	if (data.region !== undefined) set.region = data.region ?? '';
	if (data.startDate !== undefined) set.startDate = data.startDate;
	if (data.endDate !== undefined) set.endDate = data.endDate;
	if (data.venue !== undefined) set.venue = data.venue ?? '';
	if (data.website !== undefined) set.website = data.website ?? '';
	if (data.scale !== undefined) set.scale = data.scale ?? 'medium';
	if (data.description !== undefined) set.description = data.description ?? '';
	if (data.focus !== undefined) set.focus = data.focus ?? [];
	if (data.exhibitors !== undefined) set.exhibitors = data.exhibitors ?? null;
	if (data.visitors !== undefined) set.visitors = data.visitors ?? null;
	if (data.metaTitle !== undefined) set.metaTitle = data.metaTitle ?? '';
	if (data.metaDescription !== undefined) set.metaDescription = data.metaDescription ?? '';
	if (data.keywords !== undefined) set.keywords = data.keywords ?? '';
	// `status` is plain TEXT in D1 — this is the only gate keeping the write set
	// inside TRADE_SHOW_STATUSES.
	if (data.status !== undefined) set.status = data.status;

	try {
		const [row] = await db
			.update(tradeShows)
			.set(set)
			.where(eq(tradeShows.id, params.id))
			.returning(tradeShowColumns);
		if (!row) return json({ error: 'Not found' }, { status: 404 });
		await invalidateCache('/api/trade-shows', `/api/trade-shows/${params.id}`);
		return json(row);
	} catch (error: unknown) {
		return json(
			{ error: error instanceof Error ? error.message : 'Update failed' },
			{ status: 500 }
		);
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
			.delete(tradeShows)
			.where(eq(tradeShows.id, params.id))
			.returning({ id: tradeShows.id });
		if (!row) return json({ error: 'Not found' }, { status: 404 });
		await invalidateCache('/api/trade-shows', `/api/trade-shows/${params.id}`);
		return json({ deleted: true });
	} catch (error: unknown) {
		return json(
			{ error: error instanceof Error ? error.message : 'Delete failed' },
			{ status: 500 }
		);
	}
};
