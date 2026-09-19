import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { marketGuides } from '#lib/server/db/schema.js';
import { marketGuideColumns } from '#lib/server/db/projections.js';
import { eq } from 'drizzle-orm';
import { cachedQuery, cacheLong, invalidateCache } from '#lib/server/cache.js';
import { getSession } from '#lib/server/auth.js';
import { requireAdmin } from '#lib/server/auth-guard.js';
import { marketGuideUpdateSchema } from '#lib/schemas/market-guides.js';
import { getMarketGuide } from '#lib/data/market-guides.js';

export const GET: RequestHandler = async (event) => {
	const { params, url } = event;
	const db = getDb(getBindings().DB);

	if (!db) {
		const row = getMarketGuide(params.slug);
		if (!row) return json({ error: 'Not found' }, { status: 404 });
		return json(row);
	}

	try {
		// Visibility guard: static fallback entries are curated public content;
		// non-active DB rows resolve for authenticated sessions only, and are
		// never edge-cached.
		const [row] = await db
			.select(marketGuideColumns)
			.from(marketGuides)
			.where(eq(marketGuides.slug, params.slug))
			.limit(1);

		if (!row) {
			const fallback = getMarketGuide(params.slug);
			if (!fallback) return json({ error: 'Not found' }, { status: 404 });
			return json(fallback);
		}

		if (row.status !== 'active') {
			const session = await getSession(event);
			if (!session) return json({ error: 'Not found' }, { status: 404 });
			return json(row, { headers: { 'Cache-Control': 'private, no-store' } });
		}

		const cached = await cachedQuery(
			url.toString(),
			async () => row ?? null,
			{ ...cacheLong() }
		);

		if (!cached) return json({ error: 'Not found' }, { status: 404 });
		return json(cached);
	} catch {
		const row = getMarketGuide(params.slug);
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

	const parsed = marketGuideUpdateSchema.safeParse(body);
	if (!parsed.success) {
		return json(
			{ error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
			{ status: 400 }
		);
	}

	const data = parsed.data;
	const set: Partial<typeof marketGuides.$inferInsert> = { updatedAt: new Date() };

	if (data.country !== undefined) set.country = data.country;
	if (data.flag !== undefined) set.flag = data.flag ?? '';
	if (data.region !== undefined) set.region = data.region ?? '';
	if (data.muslimPopulation !== undefined) set.muslimPopulation = data.muslimPopulation ?? '';
	if (data.totalPopulation !== undefined) set.totalPopulation = data.totalPopulation ?? '';
	if (data.marketSizeUsd !== undefined) set.marketSizeUsd = data.marketSizeUsd ?? '';
	if (data.mandateStatus !== undefined) set.mandateStatus = data.mandateStatus ?? '';
	if (data.mandatorySince !== undefined) set.mandatorySince = data.mandatorySince ?? '';
	if (data.certifyingBodies !== undefined) set.certifyingBodies = data.certifyingBodies ?? [];
	if (data.importRequirements !== undefined) set.importRequirements = data.importRequirements ?? [];
	if (data.standardBasis !== undefined) set.standardBasis = data.standardBasis ?? '';
	if (data.certificateValidity !== undefined) set.certificateValidity = data.certificateValidity ?? '';
	if (data.estimatedCostUsd !== undefined) set.estimatedCostUsd = data.estimatedCostUsd ?? '';
	if (data.processingTime !== undefined) set.processingTime = data.processingTime ?? '';
	if (data.keyInsights !== undefined) set.keyInsights = data.keyInsights ?? [];
	if (data.opportunities !== undefined) set.opportunities = data.opportunities ?? [];
	if (data.challenges !== undefined) set.challenges = data.challenges ?? [];
	if (data.summary !== undefined) set.summary = data.summary ?? '';
	if (data.metaTitle !== undefined) set.metaTitle = data.metaTitle ?? '';
	if (data.metaDescription !== undefined) set.metaDescription = data.metaDescription ?? '';
	if (data.keywords !== undefined) set.keywords = data.keywords ?? '';
	// `status` is plain TEXT in D1 — this is the only gate keeping the write set
	// inside MARKET_GUIDE_STATUSES.
	if (data.status !== undefined) set.status = data.status;

	try {
		const [row] = await db
			.update(marketGuides)
			.set(set)
			.where(eq(marketGuides.slug, params.slug))
			.returning(marketGuideColumns);
		if (!row) return json({ error: 'Not found' }, { status: 404 });
		await invalidateCache('/api/market-guides', `/api/market-guides/${params.slug}`);
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
			.delete(marketGuides)
			.where(eq(marketGuides.slug, params.slug))
			.returning({ slug: marketGuides.slug });
		if (!row) return json({ error: 'Not found' }, { status: 404 });
		await invalidateCache('/api/market-guides', `/api/market-guides/${params.slug}`);
		return json({ deleted: true });
	} catch (error: unknown) {
		return json(
			{ error: error instanceof Error ? error.message : 'Delete failed' },
			{ status: 500 }
		);
	}
};
