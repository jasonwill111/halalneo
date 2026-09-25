import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { promotions } from '#lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { invalidateCache, cachedQuery, cacheMedium } from '#lib/server/cache.js';
import { getSession } from '#lib/server/auth.js';

export const GET: RequestHandler = async (event) => {
	const { params, url } = event;
	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	try {
		const r = await cachedQuery(
			url.pathname,
			async () => {
				const [row] = await db
					.select()
					.from(promotions)
					.where(eq(promotions.id, params.id))
					.limit(1);
				return row ?? null;
			},
			{ ...cacheMedium() }
		);
		if (!r) return json({ error: 'Not found' }, { status: 404 });
		return json(r);
	} catch (e: unknown) {
		return json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async (event) => {
	const { request, params } = event;
	const session = await getSession(event);
	if (!session?.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
	if (!body) return json({ error: 'Request body is required' }, { status: 400 });

	try {
		const [existing] = await db
			.select()
			.from(promotions)
			.where(eq(promotions.id, params.id))
			.limit(1);
		if (!existing) return json({ error: 'Not found' }, { status: 404 });

		const updates: Record<string, unknown> = {};
		if (body.status !== undefined) updates.status = body.status;
		if (body.title !== undefined) updates.title = String(body.title).trim();
		if (body.description !== undefined) updates.description = body.description || null;
		if (body.supplierSlug !== undefined) updates.supplierSlug = String(body.supplierSlug).trim();
		if (body.productSlug !== undefined) updates.productSlug = body.productSlug || null;
		if (body.discountPct !== undefined) updates.discountPct = body.discountPct ?? null;
		if (body.priceMin !== undefined) updates.priceMin = body.priceMin || null;
		if (body.priceMax !== undefined) updates.priceMax = body.priceMax || null;
		if (body.priceUnit !== undefined) updates.priceUnit = body.priceUnit || null;
		if (body.moq !== undefined) updates.moq = body.moq || null;
		if (body.validUntil !== undefined) updates.validUntil = body.validUntil || null;

		if (Object.keys(updates).length === 0) {
			return json({ error: 'No fields to update' }, { status: 400 });
		}

		updates.updatedAt = new Date();
		await db.update(promotions).set(updates).where(eq(promotions.id, params.id));

		await invalidateCache('/api/promotions', `/api/promotions/${params.id}`);
		return json({ ok: true });
	} catch (e: unknown) {
		return json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async (event) => {
	const { params } = event;
	const session = await getSession(event);
	if (!session?.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	try {
		const [existing] = await db
			.select()
			.from(promotions)
			.where(eq(promotions.id, params.id))
			.limit(1);
		if (!existing) return json({ error: 'Not found' }, { status: 404 });

		await db.delete(promotions).where(eq(promotions.id, params.id));
		await invalidateCache('/api/promotions', `/api/promotions/${params.id}`);
		return json({ ok: true });
	} catch (e: unknown) {
		return json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
	}
};
