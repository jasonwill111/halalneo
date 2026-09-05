import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDbFromPlatform } from '#lib/server/db/api-helpers.js';
import { certifyingBodies, suppliers, products } from '#lib/server/db/schema.js';
import { eq, like, inArray } from 'drizzle-orm';
import { cachedQuery, cacheLong, invalidateCache } from '#lib/server/cache.js';
import { getSession } from '#lib/server/auth.js';

const ALLOWED_CB_FIELDS = new Set(['name', 'slug', 'description', 'website', 'country']);

export const GET: RequestHandler = async ({ params, url, platform }) => {
	const db = getDbFromPlatform(platform);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	try {
		const row = await cachedQuery(
			url.toString(),
			async () => {
				const [row] = await db.select().from(certifyingBodies).where(eq(certifyingBodies.id, params.id)).limit(1);
				return row ?? null;
			},
			{ ...cacheLong() }
		);

		if (!row) return json({ error: 'Not found' }, { status: 404 });
		return json(row);
	} catch (e: any) {
		return json({ error: e?.message ?? 'Failed' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ params, request, platform }) => {
	const session = await getSession({ platform, request, locals: {} } as any);
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const db = getDbFromPlatform(platform);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const body = (((await request.json()) as any).catch(() => null)) as Record<string, unknown> | null;
	if (!body) return json({ error: 'Invalid body' }, { status: 400 });

	const { action } = body;

	if (action === 'suppliers') {
		try {
			const data = await cachedQuery(
				`cert-body-suppliers:${params.id}`,
				async () => {
					const certifiedSuppliers = await db
						.select()
						.from(suppliers)
						.where(like(suppliers.certifications, `%"bodyId":"${params.id}"%`));

					if (certifiedSuppliers.length === 0) {
						return { suppliers: [], certificationTypes: [] };
					}

					const supplierSlugs = certifiedSuppliers.map((s: any) => s.slug);
					const certifiedProducts = await db
						.select({ categorySlug: products.categorySlug })
						.from(products)
						.where(inArray(products.supplierSlug, supplierSlugs));

					const certificationTypes = [...new Set(certifiedProducts.map((p: any) => p.categorySlug).filter(Boolean))];

					return { suppliers: certifiedSuppliers, certificationTypes };
				},
				{ ...cacheLong() }
			);
			return json(data);
		} catch (e: any) {
			return json({ error: e?.message ?? 'Query failed' }, { status: 500 });
		}
	}

	return json({ error: 'Invalid action' }, { status: 400 });
};

export const PUT: RequestHandler = async ({ params, request, platform }) => {
	const session = await getSession({ platform, request, locals: {} } as any);
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const db = getDbFromPlatform(platform);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const body = (((await request.json()) as any).catch(() => null)) as Record<string, unknown> | null;
	if (!body) return json({ error: 'Invalid body' }, { status: 400 });

	const { id: _id, ...rawUpdates } = body;
	const updates: Record<string, unknown> = {};
	for (const [k, v] of Object.entries(rawUpdates)) {
		if (ALLOWED_CB_FIELDS.has(k)) updates[k] = v;
	}
	updates.updatedAt = new Date();

	try {
		const [row] = await db
			.update(certifyingBodies)
			.set(updates as any)
			.where(eq(certifyingBodies.id, params.id))
			.returning();
		if (!row) return json({ error: 'Not found' }, { status: 404 });
		await invalidateCache('/api/certifying-bodies', `/api/certifying-bodies/${params.id}`);
		return json(row);
	} catch (e: any) {
		return json({ error: e?.message ?? 'Update failed' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params, request, platform }) => {
	const session = await getSession({ platform, request, locals: {} } as any);
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const db = getDbFromPlatform(platform);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	try {
		const [row] = await db
			.delete(certifyingBodies)
			.where(eq(certifyingBodies.id, params.id))
			.returning();
		if (!row) return json({ error: 'Not found' }, { status: 404 });
		await invalidateCache('/api/certifying-bodies', `/api/certifying-bodies/${params.id}`);
		return json({ deleted: true });
	} catch (e: any) {
		return json({ error: e?.message ?? 'Delete failed' }, { status: 500 });
	}
};
