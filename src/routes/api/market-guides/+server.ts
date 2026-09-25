import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseQuery } from '#lib/server/db/api-helpers.js';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { marketGuides } from '#lib/server/db/schema.js';
import { marketGuideColumns } from '#lib/server/db/projections.js';
import { and, eq, like, sql } from 'drizzle-orm';
import { cachedQuery, invalidateCache, queryCacheKey } from '#lib/server/cache.js';
import { requireAdmin } from '#lib/server/auth-guard.js';
import {
	marketGuideCreateSchema,
	MARKET_GUIDE_STATUSES,
	slugifyMarketGuide,
	type MarketGuideStatus
} from '#lib/schemas/market-guides.js';
import { marketGuides as staticMarketGuides } from '#lib/data/market-guides.js';

type Db = NonNullable<ReturnType<typeof getDb>>;
type StatusFilter = MarketGuideStatus | 'all';

/**
 * Query status filter. `all` is the admin view (every row regardless of
 * visibility) and is only answered for allowlisted admins; unknown values
 * fall back to the public default so a bad link never dumps the table.
 */
function resolveStatusFilter(raw: string | null): StatusFilter {
	if (raw === 'all') return 'all';
	return MARKET_GUIDE_STATUSES.includes(raw as MarketGuideStatus)
		? (raw as MarketGuideStatus)
		: 'active';
}

/** Static seed entries are curated public content — implicitly active. */
function fallbackList(offset: number, limit: number, search?: string, country?: string) {
	let filtered = [...staticMarketGuides];
	if (search) {
		filtered = filtered.filter((g) => g.country.toLowerCase().includes(search.toLowerCase()));
	}
	if (country) filtered = filtered.filter((g) => g.country === country);
	const items = filtered.slice(offset, offset + limit).map((g) => ({ ...g, status: 'active' }));
	return { items, total: filtered.length, limit, offset };
}

async function queryList(
	db: Db,
	status: StatusFilter,
	search: string | undefined,
	country: string | undefined,
	limit: number,
	offset: number
) {
	const conditions = [];
	if (search) conditions.push(like(marketGuides.country, `%${search}%`));
	if (status !== 'all') conditions.push(eq(marketGuides.status, status));
	if (country) conditions.push(eq(marketGuides.country, country));
	const where = conditions.length ? and(...conditions) : undefined;

	const [countResult] = await db
		.select({ count: sql<number>`count(*)` })
		.from(marketGuides)
		.where(where);

	const rows = await db
		.select(marketGuideColumns)
		.from(marketGuides)
		.where(where)
		.orderBy(sql`${marketGuides.country} ASC`)
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

	if (!db) {
		return json(fallbackList(offset, limit, search, country));
	}

	try {
		// Admin view: uncached, and the response must never be shared by the
		// edge cache (drafts would leak to anonymous visitors).
		if (status === 'all') {
			const denied = await requireAdmin(event);
			if (denied) return denied;
			const data = await queryList(db, status, search, country, limit, offset);
			return json(data, { headers: { 'Cache-Control': 'no-store' } });
		}

		const data = await cachedQuery(
			url.toString(),
			() => queryList(db, status, search, country, limit, offset),
			{ ttl: 300, cacheKey: queryCacheKey(url).toString() }
		);

		return json(data);
	} catch {
		return json(fallbackList(offset, limit, search, country));
	}
};

export const POST: RequestHandler = async (event) => {
	const denied = await requireAdmin(event);
	if (denied) return denied;

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const body = (await event.request.json().catch(() => null)) as unknown;
	if (!body) return json({ error: 'Request body is required' }, { status: 400 });

	const parsed = marketGuideCreateSchema.safeParse(body);
	if (!parsed.success) {
		return json(
			{ error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
			{ status: 400 }
		);
	}

	const slug = parsed.data.slug?.trim() || slugifyMarketGuide(parsed.data.country);
	if (!slug) {
		return json(
			{ error: 'Validation failed', details: { country: ['Country is required.'] } },
			{ status: 400 }
		);
	}

	const now = new Date();
	const values: typeof marketGuides.$inferInsert = {
		slug,
		country: parsed.data.country,
		flag: parsed.data.flag ?? '',
		region: parsed.data.region ?? '',
		muslimPopulation: parsed.data.muslimPopulation ?? '',
		totalPopulation: parsed.data.totalPopulation ?? '',
		marketSizeUsd: parsed.data.marketSizeUsd ?? '',
		mandateStatus: parsed.data.mandateStatus ?? '',
		mandatorySince: parsed.data.mandatorySince ?? '',
		certifyingBodies: parsed.data.certifyingBodies ?? [],
		importRequirements: parsed.data.importRequirements ?? [],
		standardBasis: parsed.data.standardBasis ?? '',
		certificateValidity: parsed.data.certificateValidity ?? '',
		estimatedCostUsd: parsed.data.estimatedCostUsd ?? '',
		processingTime: parsed.data.processingTime ?? '',
		keyInsights: parsed.data.keyInsights ?? [],
		opportunities: parsed.data.opportunities ?? [],
		challenges: parsed.data.challenges ?? [],
		summary: parsed.data.summary ?? '',
		metaTitle: parsed.data.metaTitle ?? '',
		metaDescription: parsed.data.metaDescription ?? '',
		keywords: parsed.data.keywords ?? '',
		status: parsed.data.status ?? 'active',
		createdAt: now,
		updatedAt: now
	};

	try {
		const [row] = await db
			.insert(marketGuides)
			.values(values)
			.returning({ slug: marketGuides.slug });
		await invalidateCache('/api/market-guides', '/market-guides');
		return json({ slug: row.slug, status: values.status }, { status: 201 });
	} catch (error: unknown) {
		if (error instanceof Error && error.message.includes('UNIQUE constraint')) {
			return json({ error: 'Market guide with this slug already exists' }, { status: 409 });
		}
		return json(
			{ error: error instanceof Error ? error.message : 'Internal error' },
			{ status: 500 }
		);
	}
};
