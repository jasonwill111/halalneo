import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { certifyingBodies, suppliers, products } from '#lib/server/db/schema.js';
import { eq, inArray, and } from 'drizzle-orm';
import { cachedQuery, cacheLong, invalidateCache } from '#lib/server/cache.js';
import { getSession } from '#lib/server/auth.js';
import { requireAdmin } from '#lib/server/auth-guard.js';
import { ftsSlugs } from '#lib/server/fts.js';
import { certifyingBodyUpdateSchema } from '#lib/schemas/certifying-bodies.js';
import { z } from 'zod';

/** Explicit column projection — never SELECT * (§5.9). */
const CB_COLUMNS = {
	id: certifyingBodies.id,
	name: certifyingBodies.name,
	country: certifyingBodies.country,
	standard: certifyingBodies.standard,
	website: certifyingBodies.website,
	description: certifyingBodies.description,
	status: certifyingBodies.status,
	metaTitle: certifyingBodies.metaTitle,
	metaDescription: certifyingBodies.metaDescription,
	keywords: certifyingBodies.keywords,
	createdAt: certifyingBodies.createdAt,
	updatedAt: certifyingBodies.updatedAt
};

export const GET: RequestHandler = async (event) => {
	const { params, url } = event;
	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	try {
		// Visibility guard: only active bodies are public. Non-active rows
		// (pending/inactive) resolve for authenticated sessions only, and are
		// never edge-cached.
		const [row] = await db
			.select(CB_COLUMNS)
			.from(certifyingBodies)
			.where(eq(certifyingBodies.id, params.id))
			.limit(1);

		if (!row) return json({ error: 'Not found' }, { status: 404 });

		if (row.status !== 'active') {
			const session = await getSession(event);
			if (!session) return json({ error: 'Not found' }, { status: 404 });
			return json(row, { headers: { 'Cache-Control': 'private, no-store' } });
		}

		const cached = await cachedQuery(url.toString(), async () => row, { ...cacheLong() });

		if (!cached) return json({ error: 'Not found' }, { status: 404 });
		return json(cached);
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : '';
		return json({ error: message || 'Failed' }, { status: 500 });
	}
};

/**
 * Read-side helper used by the public certifier page: `POST { action: 'suppliers' }`
 * returns the certified suppliers + product categories behind this body.
 * It is not a write, so it keeps the pre-existing session visibility guard
 * instead of the admin allowlist.
 */
export const POST: RequestHandler = async (event) => {
	const { params, request } = event;
	const session = await getSession(event);
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const body: unknown = await request.json().catch(() => null);
	const parsed = z.object({ action: z.string().max(40).optional() }).safeParse(body);
	if (!parsed.success) return json({ error: 'Invalid body' }, { status: 400 });
	const action = parsed.data.action;

	if (action === 'suppliers') {
		try {
			const data = await cachedQuery(
				`cert-body-suppliers:${params.id}`,
				async () => {
					// Public page payload: only active suppliers, minimal columns
					// (no adminNotes/emails — this response is edge-cached).
					// Indexed FTS lookup on certifications JSON (replaces LIKE scan).
					const certSlugs = await ftsSlugs(db, 'suppliers', `"${params.id}"`, 200);
					const certifiedSuppliers = await db
						.select({
							slug: suppliers.slug,
							name: suppliers.name,
							country: suppliers.country
						})
						.from(suppliers)
						.where(and(eq(suppliers.status, 'active'), inArray(suppliers.slug, certSlugs)));

					if (certifiedSuppliers.length === 0) {
						return { suppliers: [], certificationTypes: [] };
					}

					const supplierSlugs = certifiedSuppliers.map((s) => s.slug);
					const certifiedProducts = await db
						.select({ categorySlug: products.categorySlug })
						.from(products)
						.where(inArray(products.supplierSlug, supplierSlugs));

					const certificationTypes = [
						...new Set(certifiedProducts.map((p) => p.categorySlug).filter(Boolean))
					];

					return { suppliers: certifiedSuppliers, certificationTypes };
				},
				{ ...cacheLong() }
			);
			return json(data);
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : '';
			return json({ error: message || 'Query failed' }, { status: 500 });
		}
	}

	return json({ error: 'Invalid action' }, { status: 400 });
};

/**
 * Full-record update (the admin form always submits every editable column).
 * `id` is the primary key and stays immutable — it is taken from the path.
 */
export const PUT: RequestHandler = async (event) => {
	const { params, request } = event;
	const denied = await requireAdmin(event);
	if (denied) return denied;

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const body: unknown = await request.json().catch(() => null);
	const parsed = certifyingBodyUpdateSchema.safeParse(body);
	if (!parsed.success) {
		return json(
			{ error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
			{ status: 400 }
		);
	}

	try {
		const [row] = await db
			.update(certifyingBodies)
			.set({
				name: parsed.data.name,
				country: parsed.data.country,
				standard: parsed.data.standard ?? null,
				website: parsed.data.website ?? null,
				description: parsed.data.description ?? null,
				status: parsed.data.status ?? 'active',
				metaTitle: parsed.data.metaTitle ?? null,
				metaDescription: parsed.data.metaDescription ?? null,
				keywords: parsed.data.keywords ?? null,
				updatedAt: new Date()
			})
			.where(eq(certifyingBodies.id, params.id))
			.returning(CB_COLUMNS);
		if (!row) return json({ error: 'Not found' }, { status: 404 });
		await invalidateCache('/api/certifying-bodies', `/api/certifying-bodies/${params.id}`);
		return json(row);
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : '';
		return json({ error: message || 'Update failed' }, { status: 500 });
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
			.delete(certifyingBodies)
			.where(eq(certifyingBodies.id, params.id))
			.returning({ id: certifyingBodies.id });
		if (!row) return json({ error: 'Not found' }, { status: 404 });
		await invalidateCache('/api/certifying-bodies', `/api/certifying-bodies/${params.id}`);
		return json({ deleted: true });
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : '';
		return json({ error: message || 'Delete failed' }, { status: 500 });
	}
};
