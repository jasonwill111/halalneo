import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { serviceProviders } from '#lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { cachedQuery, cacheLong, invalidateCache } from '#lib/server/cache.js';
import { getSession } from '#lib/server/auth.js';
import { requireAdmin } from '#lib/server/auth-guard.js';
import { serviceProviderUpdateSchema } from '#lib/schemas/service-providers.js';

/** Explicit column projection — never SELECT * (§5.9). */
const SP_COLUMNS = {
	slug: serviceProviders.slug,
	name: serviceProviders.name,
	type: serviceProviders.type,
	country: serviceProviders.country,
	description: serviceProviders.description,
	website: serviceProviders.website,
	email: serviceProviders.email,
	phone: serviceProviders.phone,
	whatsapp: serviceProviders.whatsapp,
	line: serviceProviders.line,
	rating: serviceProviders.rating,
	status: serviceProviders.status,
	metaTitle: serviceProviders.metaTitle,
	metaDescription: serviceProviders.metaDescription,
	keywords: serviceProviders.keywords,
	createdAt: serviceProviders.createdAt,
	updatedAt: serviceProviders.updatedAt
};

export const GET: RequestHandler = async (event) => {
	const { params, url } = event;
	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	try {
		// Visibility guard: only active providers are public. Non-active rows
		// resolve for authenticated sessions only, and are never edge-cached.
		const [row] = await db
			.select(SP_COLUMNS)
			.from(serviceProviders)
			.where(eq(serviceProviders.slug, params.slug))
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
 * Full-record update (the admin form always submits every editable column).
 * `slug` is the primary key and stays immutable — it is taken from the path.
 */
export const PUT: RequestHandler = async (event) => {
	const { params, request } = event;
	const denied = await requireAdmin(event);
	if (denied) return denied;

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const body: unknown = await request.json().catch(() => null);
	const parsed = serviceProviderUpdateSchema.safeParse(body);
	if (!parsed.success) {
		return json(
			{ error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
			{ status: 400 }
		);
	}

	try {
		const [row] = await db
			.update(serviceProviders)
			.set({
				name: parsed.data.name,
				type: parsed.data.type,
				country: parsed.data.country,
				description: parsed.data.description ?? null,
				website: parsed.data.website ?? null,
				email: parsed.data.email ?? null,
				phone: parsed.data.phone ?? null,
				whatsapp: parsed.data.whatsapp ?? null,
				line: parsed.data.line ?? null,
				rating: parsed.data.rating ?? null,
				status: parsed.data.status ?? 'pending',
				metaTitle: parsed.data.metaTitle ?? null,
				metaDescription: parsed.data.metaDescription ?? null,
				keywords: parsed.data.keywords ?? null,
				updatedAt: new Date()
			})
			.where(eq(serviceProviders.slug, params.slug))
			.returning(SP_COLUMNS);
		if (!row) return json({ error: 'Not found' }, { status: 404 });
		await invalidateCache('/api/service-providers', `/api/service-providers/${params.slug}`);
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
			.delete(serviceProviders)
			.where(eq(serviceProviders.slug, params.slug))
			.returning({ slug: serviceProviders.slug });
		if (!row) return json({ error: 'Not found' }, { status: 404 });
		await invalidateCache('/api/service-providers', `/api/service-providers/${params.slug}`);
		return json({ deleted: true });
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : '';
		return json({ error: message || 'Delete failed' }, { status: 500 });
	}
};
