import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { buyingRequests } from '#lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { invalidateCache } from '#lib/server/cache.js';
import { getSession } from '#lib/server/auth.js';

export const GET: RequestHandler = async (event) => {
	const { params, url } = event;
	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	try {
		const [r] = await db.select().from(buyingRequests).where(eq(buyingRequests.id, params.id)).limit(1);
		if (!r) return json({ error: 'Not found' }, { status: 404 });
		return json(r);
	} catch (e: any) {
		return json({ error: e?.message ?? 'Failed' }, { status: 500 });
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
		const [existing] = await db.select().from(buyingRequests).where(eq(buyingRequests.id, params.id)).limit(1);
		if (!existing) return json({ error: 'Not found' }, { status: 404 });

		const updates: Record<string, unknown> = {};
		if (body.status !== undefined) updates.status = body.status;
		if (body.title !== undefined) updates.title = String(body.title).trim();
		if (body.description !== undefined) updates.description = String(body.description).trim();
		if (body.categorySlug !== undefined) updates.categorySlug = body.categorySlug || null;
		if (body.quantity !== undefined) updates.quantity = body.quantity || null;
		if (body.targetPrice !== undefined) updates.targetPrice = body.targetPrice || null;
		if (body.destination !== undefined) updates.destination = body.destination || null;
		if (body.buyerCountry !== undefined) updates.buyerCountry = body.buyerCountry || null;

		if (Object.keys(updates).length === 0) {
			return json({ error: 'No fields to update' }, { status: 400 });
		}

		updates.updatedAt = new Date();
		await db.update(buyingRequests).set(updates).where(eq(buyingRequests.id, params.id));

		await invalidateCache('/api/rfqs');
		return json({ ok: true });
	} catch (e: any) {
		return json({ error: e?.message ?? 'Failed' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async (event) => {
	const { params } = event;
	const session = await getSession(event);
	if (!session?.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	try {
		const [existing] = await db.select().from(buyingRequests).where(eq(buyingRequests.id, params.id)).limit(1);
		if (!existing) return json({ error: 'Not found' }, { status: 404 });

		await db.delete(buyingRequests).where(eq(buyingRequests.id, params.id));
		await invalidateCache('/api/rfqs');
		return json({ ok: true });
	} catch (e: any) {
		return json({ error: e?.message ?? 'Failed' }, { status: 500 });
	}
};
