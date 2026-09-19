import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { suppliers } from '#lib/server/db/schema.js';
import { cachedQuery, cacheMedium, invalidateCache, queryCacheKey } from '#lib/server/cache.js';
import { getSupplierListItems } from '#lib/server/queries/index.js';
import { parseQuery } from '#lib/server/db/api-helpers.js';
import { requireAdmin } from '#lib/server/auth-guard.js';
import { SupplierCreateSchema } from '#lib/schemas/suppliers.js';
import type { ZodError } from 'zod';

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

// ==================== GET: supplier list (public, projected + paged) ====================
// 8 projected columns via getSupplierListItems — certifications/contacts/SEO
// TEXT columns stay in D1. Filters (status / country / businessType) are indexed;
// `search` runs through suppliers_fts instead of LIKE '%…%'.
export const GET: RequestHandler = async (event) => {
	const { url } = event;
	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const requestedStatus = url.searchParams.get('status');
	// status=all → admin overview (also used by /admin/products for its supplier
	// picker, which must list pending/suspended suppliers too). Admin-only and
	// never cached: the list has to reflect the write that just happened.
	if (requestedStatus === 'all') {
		const denied = await requireAdmin(event);
		if (denied) return denied;
	}

	try {
		const { limit, offset, search } = parseQuery(url);
		const query = () =>
			getSupplierListItems(db, {
				limit,
				offset,
				search,
				status: requestedStatus === 'all' ? undefined : requestedStatus || 'active',
				country: url.searchParams.get('country') || undefined,
				businessType: url.searchParams.get('businessType') || undefined
			});

		if (requestedStatus === 'all') return json(await query());

		const data = await cachedQuery(url.toString(), query, {
			...cacheMedium(),
			cacheKey: queryCacheKey(url).toString()
		});
		return json(data);
	} catch (e) {
		return serverFailure(e, 'Failed to load suppliers');
	}
};

// ==================== POST: create a supplier profile (admin only) ====================
export const POST: RequestHandler = async (event) => {
	const denied = await requireAdmin(event);
	if (denied) return denied;

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const body: unknown = await event.request.json().catch(() => null);
	if (!isRecord(body))
		return json({ error: 'Request body must be a JSON object' }, { status: 400 });

	const parsed = SupplierCreateSchema.safeParse(body);
	if (!parsed.success) return validationFailed(parsed.error);
	const d = parsed.data;

	try {
		const now = new Date();
		const [row] = await db
			.insert(suppliers)
			.values({
				slug: d.slug,
				name: d.name,
				country: d.country,
				businessType: d.businessType,
				status: d.status,
				isBrand: d.isBrand,
				adminNotes: d.adminNotes ?? null,
				logoInitials: d.logoInitials ?? null,
				description: d.description ?? null,
				coverImage: d.coverImage ?? null,
				website: d.website ?? null,
				email: d.email ?? null,
				phone: d.phone ?? null,
				whatsapp: d.whatsapp ?? null,
				line: d.line ?? null,
				yearEstablished: d.yearEstablished ?? null,
				employeeCount: d.employeeCount ?? null,
				productionCapacity: d.productionCapacity ?? null,
				// JSON TEXT columns
				mainMarkets: d.mainMarkets ? JSON.stringify(d.mainMarkets) : null,
				certifications: d.certifications ? JSON.stringify(d.certifications) : null,
				metaTitle: d.metaTitle ?? null,
				metaDescription: d.metaDescription ?? null,
				keywords: d.keywords ?? null,
				createdAt: now,
				updatedAt: now
			})
			.returning({ slug: suppliers.slug });

		await invalidateCache('/api/suppliers', '/suppliers');
		return json({ slug: row.slug }, { status: 201 });
	} catch (e) {
		const message = e instanceof Error ? e.message : '';
		if (message.includes('UNIQUE constraint')) {
			return json(
				{
					error: 'Supplier with this slug already exists',
					details: { slug: ['This slug is already taken.'] }
				},
				{ status: 409 }
			);
		}
		return serverFailure(e, 'Internal error');
	}
};
