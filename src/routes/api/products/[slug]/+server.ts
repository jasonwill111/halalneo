import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { categories, products, suppliers } from '#lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { cachedQuery, cacheLong, invalidateCache } from '#lib/server/cache.js';
import { getSession } from '#lib/server/auth.js';
import { requireAdmin } from '#lib/server/auth-guard.js';
import { ProductUpdateSchema } from '#lib/schemas/products.js';
import type { ZodError } from 'zod';

type Db = NonNullable<ReturnType<typeof getDb>>;

function validationFailed(error: ZodError) {
	return json(
		{ error: 'Validation failed', details: error.flatten().fieldErrors },
		{ status: 400 }
	);
}

function serverFailure(e: unknown, fallback: string, status = 500) {
	const message = e instanceof Error && e.message ? e.message : fallback;
	return json({ error: message }, { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Same FK guard as POST /api/products — one PK lookup per changed reference. */
async function badReference(
	db: Db,
	field: 'supplierSlug' | 'categorySlug',
	slug: string
): Promise<Record<string, string[]> | null> {
	const table = field === 'supplierSlug' ? suppliers : categories;
	const column = field === 'supplierSlug' ? suppliers.slug : categories.slug;
	const [row] = await db.select({ slug: column }).from(table).where(eq(column, slug)).limit(1);
	if (row) return null;
	return {
		[field]: [
			field === 'supplierSlug'
				? 'Unknown supplier — choose one from the list.'
				: 'Unknown category — choose one from the list.'
		]
	};
}

export const GET: RequestHandler = async (event) => {
	const { params, url } = event;
	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	try {
		// Visibility guard: only active products are public. Non-active rows
		// (draft/archived) resolve for authenticated sessions only, and are
		// never edge-cached. The admin edit form reads this route, which is why
		// the full (single-PK-row) projection lives here rather than in the list.
		const [row] = await db.select().from(products).where(eq(products.slug, params.slug)).limit(1);

		if (!row) return json({ error: 'Not found' }, { status: 404 });

		if (row.status !== 'active') {
			const session = await getSession(event);
			if (!session) return json({ error: 'Not found' }, { status: 404 });
			return json(row, { headers: { 'Cache-Control': 'private, no-store' } });
		}

		const cached = await cachedQuery(url.toString(), async () => row ?? null, { ...cacheLong() });

		if (!cached) return json({ error: 'Not found' }, { status: 404 });
		return json(cached);
	} catch (e) {
		return serverFailure(e, 'Failed');
	}
};

// ==================== PUT / PATCH: update a product (admin only) ====================
// Absent keys are left untouched; ''-style values collapse to null in the schema,
// so the form can clear an optional column without a bespoke flag.
export const PUT: RequestHandler = async (event) => {
	const { params, request } = event;
	const denied = await requireAdmin(event);
	if (denied) return denied;

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const body: unknown = await request.json().catch(() => null);
	if (!isRecord(body))
		return json({ error: 'Request body must be a JSON object' }, { status: 400 });

	const parsed = ProductUpdateSchema.safeParse(body);
	if (!parsed.success) return validationFailed(parsed.error);
	const d = parsed.data;

	if (d.supplierSlug !== undefined) {
		const bad = await badReference(db, 'supplierSlug', d.supplierSlug);
		if (bad) return json({ error: 'Validation failed', details: bad }, { status: 400 });
	}
	if (d.categorySlug !== undefined) {
		const bad = await badReference(db, 'categorySlug', d.categorySlug);
		if (bad) return json({ error: 'Validation failed', details: bad }, { status: 400 });
	}

	const patch: Partial<typeof products.$inferInsert> = {};
	if (d.name !== undefined) patch.name = d.name;
	if (d.supplierSlug !== undefined) patch.supplierSlug = d.supplierSlug;
	if (d.categorySlug !== undefined) patch.categorySlug = d.categorySlug;
	if (d.shortDescription !== undefined) patch.shortDescription = d.shortDescription;
	if (d.description !== undefined) patch.description = d.description;
	if (d.image !== undefined) patch.image = d.image;
	if (d.images !== undefined) patch.images = d.images ? JSON.stringify(d.images) : null;
	if (d.videos !== undefined) patch.videos = d.videos ? JSON.stringify(d.videos) : null;
	if (d.features !== undefined) patch.features = d.features ? JSON.stringify(d.features) : null;
	if (d.specifications !== undefined)
		patch.specifications = d.specifications ? JSON.stringify(d.specifications) : null;
	if (d.faqs !== undefined) patch.faqs = d.faqs ? JSON.stringify(d.faqs) : null;
	if (d.resources !== undefined) patch.resources = d.resources ? JSON.stringify(d.resources) : null;
	if (d.moq !== undefined) patch.moq = d.moq;
	if (d.priceMin !== undefined) patch.priceMin = d.priceMin;
	if (d.priceMax !== undefined) patch.priceMax = d.priceMax;
	if (d.priceUnit !== undefined) patch.priceUnit = d.priceUnit;
	if (d.units !== undefined) patch.units = d.units;
	if (d.originCountry !== undefined) patch.originCountry = d.originCountry;
	if (d.certStatus !== undefined) patch.certStatus = d.certStatus;
	if (d.status !== undefined) patch.status = d.status;
	if (d.metaTitle !== undefined) patch.metaTitle = d.metaTitle;
	if (d.metaDescription !== undefined) patch.metaDescription = d.metaDescription;
	if (d.keywords !== undefined) patch.keywords = d.keywords;

	if (Object.keys(patch).length === 0) {
		return json({ error: 'No updatable fields provided' }, { status: 400 });
	}
	patch.updatedAt = new Date();

	try {
		const [row] = await db
			.update(products)
			.set(patch)
			.where(eq(products.slug, params.slug))
			.returning();
		if (!row) return json({ error: 'Not found' }, { status: 404 });
		await invalidateCache('/api/products', `/api/products/${params.slug}`, '/products');
		return json(row);
	} catch (e) {
		return serverFailure(e, 'Update failed');
	}
};

export const PATCH: RequestHandler = PUT;

// ==================== DELETE: remove a product (admin only) ====================
export const DELETE: RequestHandler = async (event) => {
	const { params } = event;
	const denied = await requireAdmin(event);
	if (denied) return denied;

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	try {
		const [row] = await db.delete(products).where(eq(products.slug, params.slug)).returning();
		if (!row) return json({ error: 'Not found' }, { status: 404 });
		await invalidateCache('/api/products', `/api/products/${params.slug}`, '/products');
		return json({ deleted: true });
	} catch (e) {
		const message = e instanceof Error ? e.message : '';
		if (message.includes('FOREIGN KEY constraint')) {
			return json(
				{
					error:
						'This product still has buyer inquiries attached, so it cannot be deleted. Archive it instead.',
					details: { slug: ['Still referenced by buyer inquiries.'] }
				},
				{ status: 409 }
			);
		}
		return serverFailure(e, 'Delete failed');
	}
};
