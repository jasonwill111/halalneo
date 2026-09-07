import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDbFromPlatform } from '#lib/server/db/api-helpers.js';
import { marketGuides } from '#lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { cachedQuery, cacheLong, invalidateCache } from '#lib/server/cache.js';
import { getMarketGuide } from '#lib/data/market-guides.js';
import { getSession } from '#lib/server/auth.js';

const ALLOWED_MG_FIELDS = new Set([
	'country', 'flag', 'region', 'muslimPopulation', 'totalPopulation',
	'marketSizeUsd', 'mandateStatus', 'mandatorySince', 'certifyingBodies',
	'importRequirements', 'standardBasis', 'certificateValidity',
	'estimatedCostUsd', 'processingTime', 'keyInsights', 'opportunities',
	'challenges', 'summary', 'metaTitle', 'metaDescription', 'keywords', 'status'
]);

export const GET: RequestHandler = async ({ params, url, platform }) => {
	const db = getDbFromPlatform(platform);

	if (!db) {
		const row = getMarketGuide(params.slug);
		if (!row) return json({ error: 'Not found' }, { status: 404 });
		return json(row);
	}

	try {
		const row = await cachedQuery(
			url.toString(),
			async () => {
				const [row] = await db.select().from(marketGuides).where(eq(marketGuides.slug, params.slug)).limit(1);
				return row ?? null;
			},
			{ ...cacheLong() }
		);

		if (!row) {
			const fallback = getMarketGuide(params.slug);
			if (!fallback) return json({ error: 'Not found' }, { status: 404 });
			return json(fallback);
		}
		return json(row);
	} catch {
		const row = getMarketGuide(params.slug);
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

	const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
	if (!body) return json({ error: 'Invalid body' }, { status: 400 });

	const { slug: _slug, ...rawUpdates } = body;
	const updates: Record<string, unknown> = {};
	for (const [k, v] of Object.entries(rawUpdates)) {
		if (ALLOWED_MG_FIELDS.has(k)) updates[k] = v;
	}
	updates.updatedAt = new Date();

	try {
		const [row] = await db
			.update(marketGuides)
			.set(updates as any)
			.where(eq(marketGuides.slug, params.slug))
			.returning();
		if (!row) return json({ error: 'Not found' }, { status: 404 });
		await invalidateCache('/api/market-guides', `/api/market-guides/${params.slug}`);
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
			.delete(marketGuides)
			.where(eq(marketGuides.slug, params.slug))
			.returning();
		if (!row) return json({ error: 'Not found' }, { status: 404 });
		await invalidateCache('/api/market-guides', `/api/market-guides/${params.slug}`);
		return json({ deleted: true });
	} catch (e: any) {
		return json({ error: e?.message ?? 'Delete failed' }, { status: 500 });
	}
};
