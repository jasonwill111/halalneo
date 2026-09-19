import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { products, suppliers, supplierMembers } from '#lib/server/db/schema.js';
import { user as authUser } from '#lib/server/db/auth.schema.js';
import { eq, sql } from 'drizzle-orm';
import { cachedQuery, cacheLong, invalidateCache } from '#lib/server/cache.js';
import { getSession } from '#lib/server/auth.js';
import { requireAdmin } from '#lib/server/auth-guard.js';
import { SupplierUpdateSchema } from '#lib/schemas/suppliers.js';
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

/** Every user-facing column EXCEPT adminNotes (internal moderation notes must
 *  never ship in public / edge-cached JSON). */
const publicProjection = {
	slug: suppliers.slug,
	name: suppliers.name,
	country: suppliers.country,
	businessType: suppliers.businessType,
	isBrand: suppliers.isBrand,
	status: suppliers.status,
	logoInitials: suppliers.logoInitials,
	description: suppliers.description,
	coverImage: suppliers.coverImage,
	website: suppliers.website,
	email: suppliers.email,
	phone: suppliers.phone,
	whatsapp: suppliers.whatsapp,
	line: suppliers.line,
	yearEstablished: suppliers.yearEstablished,
	employeeCount: suppliers.employeeCount,
	productionCapacity: suppliers.productionCapacity,
	mainMarkets: suppliers.mainMarkets,
	certifications: suppliers.certifications,
	metaTitle: suppliers.metaTitle,
	metaDescription: suppliers.metaDescription,
	keywords: suppliers.keywords,
	createdAt: suppliers.createdAt,
	updatedAt: suppliers.updatedAt
};

export const GET: RequestHandler = async (event) => {
	const { params, url } = event;
	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	try {
		// Visibility guard: only approved suppliers are public. Non-active rows
		// (pending/rejected/suspended) resolve for authenticated sessions only,
		// and are never edge-cached. The admin edit form reads this route to get
		// the columns the list projection intentionally drops.
		const [row] = await db
			.select(publicProjection)
			.from(suppliers)
			.where(eq(suppliers.slug, params.slug))
			.limit(1);

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

// ==================== PUT / PATCH: update a supplier (admin only) ====================
// Absent keys are untouched, which keeps `certifications` (owned by the supplier
// portal) and `adminNotes` (owned by the review flow) safe from profile writes.
export const PUT: RequestHandler = async (event) => {
	const { params, request } = event;
	const denied = await requireAdmin(event);
	if (denied) return denied;

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const body: unknown = await request.json().catch(() => null);
	if (!isRecord(body))
		return json({ error: 'Request body must be a JSON object' }, { status: 400 });

	const parsed = SupplierUpdateSchema.safeParse(body);
	if (!parsed.success) return validationFailed(parsed.error);
	const d = parsed.data;

	const patch: Partial<typeof suppliers.$inferInsert> = {};
	if (d.name !== undefined) patch.name = d.name;
	if (d.country !== undefined) patch.country = d.country;
	if (d.businessType !== undefined) patch.businessType = d.businessType;
	if (d.status !== undefined) patch.status = d.status;
	if (d.isBrand !== undefined) patch.isBrand = d.isBrand;
	if (d.adminNotes !== undefined) patch.adminNotes = d.adminNotes;
	if (d.logoInitials !== undefined) patch.logoInitials = d.logoInitials;
	if (d.description !== undefined) patch.description = d.description;
	if (d.coverImage !== undefined) patch.coverImage = d.coverImage;
	if (d.website !== undefined) patch.website = d.website;
	if (d.email !== undefined) patch.email = d.email;
	if (d.phone !== undefined) patch.phone = d.phone;
	if (d.whatsapp !== undefined) patch.whatsapp = d.whatsapp;
	if (d.line !== undefined) patch.line = d.line;
	if (d.yearEstablished !== undefined) patch.yearEstablished = d.yearEstablished;
	if (d.employeeCount !== undefined) patch.employeeCount = d.employeeCount;
	if (d.productionCapacity !== undefined) patch.productionCapacity = d.productionCapacity;
	if (d.mainMarkets !== undefined)
		patch.mainMarkets = d.mainMarkets ? JSON.stringify(d.mainMarkets) : null;
	if (d.certifications !== undefined)
		patch.certifications = d.certifications ? JSON.stringify(d.certifications) : null;
	if (d.metaTitle !== undefined) patch.metaTitle = d.metaTitle;
	if (d.metaDescription !== undefined) patch.metaDescription = d.metaDescription;
	if (d.keywords !== undefined) patch.keywords = d.keywords;

	if (Object.keys(patch).length === 0) {
		return json({ error: 'No updatable fields provided' }, { status: 400 });
	}
	patch.updatedAt = new Date();

	try {
		const [row] = await db
			.update(suppliers)
			.set(patch)
			.where(eq(suppliers.slug, params.slug))
			.returning();
		if (!row) return json({ error: 'Not found' }, { status: 404 });
		await invalidateCache('/api/suppliers', `/api/suppliers/${params.slug}`, '/suppliers');

		// Activation hook: when a supplier flips to active, link the matching
		// registered user (by supplier email) as an owner member so they can
		// publish deals/updates. Best-effort — never blocks the update.
		if (patch.status === 'active' && row.email) {
			await linkOwnerMember(db, params.slug, row.email);
		}
		return json(row);
	} catch (e) {
		return serverFailure(e, 'Update failed');
	}
};

export const PATCH: RequestHandler = PUT;

async function linkOwnerMember(db: Db, slug: string, email: string): Promise<void> {
	try {
		const matched = await db
			.select({ id: authUser.id })
			.from(authUser)
			.where(eq(authUser.email, email))
			.limit(1);
		if (!matched[0]?.id) return;
		await db
			.insert(supplierMembers)
			.values({
				userId: matched[0].id,
				supplierSlug: slug,
				role: 'owner',
				createdAt: new Date()
			})
			.onConflictDoNothing();
	} catch {
		// membership link is a bonus, not a requirement
	}
}

// ==================== DELETE: remove a supplier (admin only) ====================
export const DELETE: RequestHandler = async (event) => {
	const { params } = event;
	const denied = await requireAdmin(event);
	if (denied) return denied;

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	// D1 enforces the products.supplierSlug / inquiries.supplierSlug FKs, so a
	// supplier with a catalogue cannot be hard-deleted. Report it as a conflict
	// with the real number instead of letting the constraint throw, and suggest
	// suspending (status change) as the operational path.
	const [blocking] = await db
		.select({ count: sql<number>`count(*)` })
		.from(products)
		.where(eq(products.supplierSlug, params.slug));
	if ((blocking?.count ?? 0) > 0) {
		return json(
			{
				error: `This supplier still lists ${blocking.count} product(s). Delete or move them first, or set the supplier to "suspended".`,
				details: { slug: ['Supplier still has published products.'] }
			},
			{ status: 409 }
		);
	}

	try {
		const [row] = await db
			.delete(suppliers)
			.where(eq(suppliers.slug, params.slug))
			.returning({ slug: suppliers.slug });
		if (!row) return json({ error: 'Not found' }, { status: 404 });
		await invalidateCache(
			'/api/suppliers',
			`/api/suppliers/${params.slug}`,
			'/api/products',
			'/suppliers'
		);
		return json({ deleted: true });
	} catch (e) {
		const message = e instanceof Error ? e.message : '';
		if (message.includes('FOREIGN KEY constraint')) {
			return json(
				{
					error:
						'This supplier still has buyer inquiries or team members attached, so it cannot be deleted.',
					details: { slug: ['Still referenced by other records.'] }
				},
				{ status: 409 }
			);
		}
		return serverFailure(e, 'Delete failed');
	}
};
