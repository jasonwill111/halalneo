import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseQuery } from '#lib/server/db/api-helpers.js';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { tradeShows } from '#lib/server/db/schema.js';
import { tradeShowColumns } from '#lib/server/db/projections.js';
import { and, eq, like, sql } from 'drizzle-orm';
import { cachedQuery, cacheMedium, invalidateCache, queryCacheKey } from '#lib/server/cache.js';
import { requireAdmin } from '#lib/server/auth-guard.js';
import {
	tradeShowCreateSchema,
	TRADE_SHOW_SCALES,
	TRADE_SHOW_STATUSES,
	type TradeShowScale,
	type TradeShowStatus
} from '#lib/schemas/trade-shows.js';
import { tradeShows as staticTradeShows } from '#lib/data/trade-shows.js';

type Db = NonNullable<ReturnType<typeof getDb>>;
type StatusFilter = TradeShowStatus | 'all';

function resolveStatusFilter(raw: string | null): StatusFilter {
	if (raw === 'all') return 'all';
	return TRADE_SHOW_STATUSES.includes(raw as TradeShowStatus) ? (raw as TradeShowStatus) : 'active';
}

function resolveScale(raw: string | null): TradeShowScale | undefined {
	return TRADE_SHOW_SCALES.includes(raw as TradeShowScale) ? (raw as TradeShowScale) : undefined;
}

function slugify(value: string): string {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/** Static seed entries are curated public content — implicitly active. */
function fallbackList(offset: number, limit: number, search?: string, country?: string, scale?: string) {
	let filtered = [...staticTradeShows];
	if (search) {
		filtered = filtered.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
	}
	if (country) filtered = filtered.filter((s) => s.country === country);
	if (scale) filtered = filtered.filter((s) => s.scale === scale);
	const items = filtered.slice(offset, offset + limit).map((s) => ({ ...s, status: 'active' }));
	return { items, total: filtered.length, limit, offset };
}

async function queryList(
	db: Db,
	status: StatusFilter,
	search: string | undefined,
	country: string | undefined,
	scale: TradeShowScale | undefined,
	limit: number,
	offset: number
) {
	const conditions = [];
	if (search) conditions.push(like(tradeShows.name, `%${search}%`));
	if (status !== 'all') conditions.push(eq(tradeShows.status, status));
	if (country) conditions.push(eq(tradeShows.country, country));
	if (scale) conditions.push(eq(tradeShows.scale, scale));
	const where = conditions.length ? and(...conditions) : undefined;

	const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(tradeShows).where(where);

	const rows = await db
		.select(tradeShowColumns)
		.from(tradeShows)
		.where(where)
		.orderBy(sql`${tradeShows.startDate} ASC`)
		.limit(limit)
		.offset(offset);

	return { items: rows, total: countResult?.count ?? 0, limit, offset };
}

export const GET: RequestHandler = async (event) => {
	const { url } = event;
	const db = getDb(getBindings().DB);
	const { limit, offset, search } = parseQuery(url);
	const status = resolveStatusFilter(url.searchParams.get('status'));
	const country = url.searchParams.get('country') || undefined;
	const scale = resolveScale(url.searchParams.get('scale'));

	if (!db) {
		return json(fallbackList(offset, limit, search, country, scale));
	}

	try {
		// Admin view (every status): requires an allowlisted admin session and
		// is never cached, so drafts/inactive rows cannot leak through the edge.
		if (status === 'all') {
			const denied = await requireAdmin(event);
			if (denied) return denied;
			const data = await queryList(db, status, search, country, scale, limit, offset);
			return json(data, { headers: { 'Cache-Control': 'no-store' } });
		}

		const data = await cachedQuery(
			url.toString(),
			() => queryList(db, status, search, country, scale, limit, offset),
			{ ...cacheMedium(), cacheKey: queryCacheKey(url) }
		);

		return json(data);
	} catch {
		return json(fallbackList(offset, limit, search, country, scale));
	}
};

export const POST: RequestHandler = async (event) => {
	const denied = await requireAdmin(event);
	if (denied) return denied;

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const body = (await event.request.json().catch(() => null)) as unknown;
	if (!body) return json({ error: 'Request body is required' }, { status: 400 });

	const parsed = tradeShowCreateSchema.safeParse(body);
	if (!parsed.success) {
		return json(
			{ error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
			{ status: 400 }
		);
	}

	const id = parsed.data.id?.trim() || slugify(parsed.data.name);
	if (!id) {
		return json(
			{ error: 'Validation failed', details: { name: ['Name is required.'] } },
			{ status: 400 }
		);
	}

	const now = new Date();
	const values: typeof tradeShows.$inferInsert = {
		id,
		name: parsed.data.name,
		city: parsed.data.city ?? '',
		country: parsed.data.country ?? '',
		region: parsed.data.region ?? '',
		startDate: parsed.data.startDate,
		endDate: parsed.data.endDate,
		venue: parsed.data.venue ?? '',
		website: parsed.data.website ?? '',
		scale: parsed.data.scale ?? 'medium',
		description: parsed.data.description ?? '',
		focus: parsed.data.focus ?? [],
		exhibitors: parsed.data.exhibitors ?? null,
		visitors: parsed.data.visitors ?? null,
		metaTitle: parsed.data.metaTitle ?? '',
		metaDescription: parsed.data.metaDescription ?? '',
		keywords: parsed.data.keywords ?? '',
		status: parsed.data.status ?? 'active',
		createdAt: now,
		updatedAt: now
	};

	try {
		const [row] = await db.insert(tradeShows).values(values).returning({ id: tradeShows.id });
		await invalidateCache('/api/trade-shows', '/trade-shows');
		return json({ id: row.id, status: values.status }, { status: 201 });
	} catch (error: unknown) {
		if (error instanceof Error && error.message.includes('UNIQUE constraint')) {
			return json({ error: 'Trade show with this id already exists' }, { status: 409 });
		}
		return json(
			{ error: error instanceof Error ? error.message : 'Internal error' },
			{ status: 500 }
		);
	}
};
