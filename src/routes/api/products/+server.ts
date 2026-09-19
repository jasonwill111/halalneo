import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { categories, products, suppliers } from '#lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { smartQuery, smartInvalidate, queryCacheKey } from '#lib/workers/smart-cache-wrapper.js';
import { getProductListItems } from '#lib/server/queries/index.js';
import { parseQuery } from '#lib/server/db/api-helpers.js';
import { requireAdmin } from '#lib/server/auth-guard.js';
import { ProductCreateSchema } from '#lib/schemas/products.js';
import type { ZodError } from 'zod';

type Db = NonNullable<ReturnType<typeof getDb>>;

/** Flatten Zod issues into the `{ error, details }` 400 shape §3.4 expects. */
function validationFailed(error: ZodError) {
	return json(
		{ error: 'Validation failed', details: error.flatten().fieldErrors },
		{ status: 400 }
	);
}

/** Never leak a raw `unknown` catch value into a response. */
function serverFailure(e: unknown, fallback: string, status = 500) {
	const message = e instanceof Error && e.message ? e.message : fallback;
	return json({ error: message }, { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** FK guards — D1 raises an opaque FOREIGN KEY error, so resolve the refs first
 *  (two PK lookups, only on writes) and report the offending form field. */
async function findBadReferences(db: Db, supplierSlug: string, categorySlug: string) {
	const details: Record<string, string[]> = {};
	const [supplier] = await db
		.select({ slug: suppliers.slug })
		.from(suppliers)
		.where(eq(suppliers.slug, supplierSlug))
		.limit(1);
	if (!supplier) details.supplierSlug = ['Unknown supplier — choose one from the list.'];
	const [category] = await db
		.select({ slug: categories.slug })
		.from(categories)
		.where(eq(categories.slug, categorySlug))
		.limit(1);
	if (!category) details.categorySlug = ['Unknown category — choose one from the list.'];
	return Object.keys(details).length ? details : null;
}

// ==================== GET: product list (public, projected + paged) ====================
// Rows come from getProductListItems: 11 projected columns, never the heavy
// description/features/specifications/faqs/resources JSON TEXT blobs.
// Filters (status / categorySlug / supplierSlug / certStatus) all sit behind a
// D1 index; `search` uses the products_fts index (no LIKE '%…%' scan).
export const GET: RequestHandler = async (event) => {
	const { url } = event;
	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const requestedStatus = url.searchParams.get('status');
	// status=all → admin overview of every status. Admin-only, and NEVER cached:
	// both the edge cache and the D1 Cache-API entry are anonymous-shared, and an
	// admin list must show the row that was just written.
	if (requestedStatus === 'all') {
		const denied = await requireAdmin(event);
		if (denied) return denied;
	}

	try {
		const { limit, offset, search } = parseQuery(url);
		const query = () =>
			getProductListItems(db, {
				limit,
				offset,
				search,
				categorySlug: url.searchParams.get('categorySlug') || undefined,
				supplierSlug: url.searchParams.get('supplierSlug') || undefined,
				certStatus: url.searchParams.get('certStatus') || undefined,
				status: requestedStatus === 'all' ? undefined : requestedStatus || 'active'
			});

		if (requestedStatus === 'all') return json(await query());

		const cacheKey = encodeURIComponent(queryCacheKey(url));
		const data = await smartQuery(cacheKey, query, { ttl: 3600, cacheKey });
		return json(data);
	} catch (e) {
		return serverFailure(e, 'Failed to load products');
	}
};

// ==================== POST: create a product (admin only) ====================
export const POST: RequestHandler = async (event) => {
	const denied = await requireAdmin(event);
	if (denied) return denied;

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const body: unknown = await event.request.json().catch(() => null);
	if (!isRecord(body))
		return json({ error: 'Request body must be a JSON object' }, { status: 400 });

	const parsed = ProductCreateSchema.safeParse(body);
	if (!parsed.success) return validationFailed(parsed.error);
	const d = parsed.data;

	const badRefs = await findBadReferences(db, d.supplierSlug, d.categorySlug);
	if (badRefs) return json({ error: 'Validation failed', details: badRefs }, { status: 400 });

	try {
		const now = new Date();
		const [row] = await db
			.insert(products)
			.values({
				slug: d.slug,
				supplierSlug: d.supplierSlug,
				categorySlug: d.categorySlug,
				name: d.name,
				shortDescription: d.shortDescription ?? null,
				description: d.description ?? null,
				image: d.image ?? null,
				// JSON TEXT columns (§6.1: arrays are validated before stringifying)
				images: d.images ? JSON.stringify(d.images) : null,
				videos: d.videos ? JSON.stringify(d.videos) : null,
				features: d.features ? JSON.stringify(d.features) : null,
				specifications: d.specifications ? JSON.stringify(d.specifications) : null,
				faqs: d.faqs ? JSON.stringify(d.faqs) : null,
				resources: d.resources ? JSON.stringify(d.resources) : null,
				moq: d.moq ?? null,
				priceMin: d.priceMin ?? null,
				priceMax: d.priceMax ?? null,
				priceUnit: d.priceUnit ?? null,
				units: d.units ?? null,
				originCountry: d.originCountry ?? null,
				certStatus: d.certStatus,
				status: d.status,
				views: 0,
				metaTitle: d.metaTitle ?? null,
				metaDescription: d.metaDescription ?? null,
				keywords: d.keywords ?? null,
				createdAt: now,
				updatedAt: now
			})
			.returning({ slug: products.slug });

		await smartInvalidate('/api/products', '/products');
		return json({ slug: row.slug }, { status: 201 });
	} catch (e) {
		const message = e instanceof Error ? e.message : '';
		if (message.includes('UNIQUE constraint')) {
			return json(
				{
					error: 'Product with this slug already exists',
					details: { slug: ['This slug is already taken.'] }
				},
				{ status: 409 }
			);
		}
		return serverFailure(e, 'Internal error');
	}
};
