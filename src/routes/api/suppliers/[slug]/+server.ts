import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { suppliers } from '#lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { cachedQuery, cacheLong, invalidateCache } from '#lib/server/cache.js';
import { getSession } from '#lib/server/auth.js';

const ALLOWED_SUPPLIER_FIELDS = new Set([
	'name', 'country', 'businessType', 'isBrand', 'status', 'adminNotes', 'logoInitials',
	'description', 'coverImage', 'website', 'email', 'phone', 'whatsapp',
	'line', 'yearEstablished', 'employeeCount', 'productionCapacity',
	'mainMarkets', 'certifications', 'metaTitle', 'metaDescription', 'keywords'
]);

export const GET: RequestHandler = async (event) => {
	const { params, url } = event;
	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	try {
		// Visibility guard: only approved suppliers are public. Non-active rows
		// (pending/rejected/suspended) resolve for authenticated admin sessions
		// only, and are never edge-cached. This also keeps SvelteKit's SSR
		// fetch-cache from embedding the raw row (name/email/adminNotes) into
		// the HTML of pages rendered for anonymous visitors.
		const [row] = await db.select().from(suppliers).where(eq(suppliers.slug, params.slug)).limit(1);

		if (!row) return json({ error: 'Not found' }, { status: 404 });

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
	} catch (e: any) {
		return json({ error: e?.message ?? 'Failed' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async (event) => {
	const { params, request } = event;
	const session = await getSession(event);
	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
	if (!body) return json({ error: 'Invalid body' }, { status: 400 });

	const { slug: _slug, ...rawUpdates } = body;
	const updates: Record<string, unknown> = {};
	for (const [k, v] of Object.entries(rawUpdates)) {
		if (ALLOWED_SUPPLIER_FIELDS.has(k)) updates[k] = v;
	}
	updates.updatedAt = new Date();

	try {
		const [row] = await db
			.update(suppliers)
			.set(updates as any)
			.where(eq(suppliers.slug, params.slug))
			.returning();
		if (!row) return json({ error: 'Not found' }, { status: 404 });
		await invalidateCache('/api/suppliers', `/api/suppliers/${params.slug}`);
		return json(row);
	} catch (e: any) {
		return json({ error: e?.message ?? 'Update failed' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async (event) => {
	const { params, request } = event;
	const session = await getSession(event);
	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	try {
		const [row] = await db
			.delete(suppliers)
			.where(eq(suppliers.slug, params.slug))
			.returning();
		if (!row) return json({ error: 'Not found' }, { status: 404 });
		await invalidateCache('/api/suppliers', `/api/suppliers/${params.slug}`);
		return json({ deleted: true });
	} catch (e: any) {
		return json({ error: e?.message ?? 'Delete failed' }, { status: 500 });
	}
};
