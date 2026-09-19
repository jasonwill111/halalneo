import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseQuery } from '#lib/server/db/api-helpers.js';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { serviceProviders } from '#lib/server/db/schema.js';
import { and, eq, like, sql } from 'drizzle-orm';
import { cachedQuery, cacheMedium, invalidateCache, queryCacheKey } from '#lib/server/cache.js';
import { requireAdmin } from '#lib/server/auth-guard.js';
import {
	serviceProviderCreateSchema,
	serviceProviderStatusSchema,
	serviceProviderTypeSchema
} from '#lib/schemas/service-providers.js';

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

export const GET: RequestHandler = async ({ url }) => {
	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	// Early return on bad filters, before touching D1 or the cache (§5.10).
	const statusResult = serviceProviderStatusSchema.safeParse(
		url.searchParams.get('status') ?? 'active'
	);
	if (!statusResult.success) {
		return json(
			{ error: "status must be one of 'active', 'pending', 'suspended'" },
			{ status: 400 }
		);
	}
	const status = statusResult.data;

	const typeParam = url.searchParams.get('type');
	const typeResult = typeParam ? serviceProviderTypeSchema.safeParse(typeParam) : null;
	if (typeResult && !typeResult.success) {
		return json({ error: 'Unknown provider type' }, { status: 400 });
	}
	const type = typeResult?.data;

	try {
		const data = await cachedQuery(
			url.toString(),
			async () => {
				// parseQuery clamps limit to <=100 and defaults offset to 0 (§5.9).
				const { limit, offset, search } = parseQuery(url);
				const country = url.searchParams.get('country') || undefined;

				const conditions = [eq(serviceProviders.status, status)];
				// LIKE only — service_providers_fts does not exist in
				// production D1, and the table is small (<500 rows).
				if (search) conditions.push(like(serviceProviders.name, `%${search}%`));
				if (type) conditions.push(eq(serviceProviders.type, type));
				if (country) conditions.push(eq(serviceProviders.country, country));

				const where = and(...conditions);

				const [countResult] = await db
					.select({ count: sql<number>`count(*)` })
					.from(serviceProviders)
					.where(where);

				const rows = await db
					.select(SP_COLUMNS)
					.from(serviceProviders)
					.where(where)
					.limit(limit)
					.offset(offset);

				return { items: rows, total: countResult?.count ?? 0, limit, offset };
			},
			{ ...cacheMedium(), cacheKey: queryCacheKey(url) }
		);

		if (!data) return json({ items: [], total: 0, limit: 0, offset: 0 }, { status: 503 });
		return json(data);
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : '';
		return json({ error: message || 'Failed' }, { status: 500 });
	}
};

export const POST: RequestHandler = async (event) => {
	const denied = await requireAdmin(event);
	if (denied) return denied;

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const body: unknown = await event.request.json().catch(() => null);
	const parsed = serviceProviderCreateSchema.safeParse(body);
	if (!parsed.success) {
		return json(
			{ error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
			{ status: 400 }
		);
	}

	const now = new Date();
	try {
		const [row] = await db
			.insert(serviceProviders)
			.values({
				slug: parsed.data.slug,
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
				createdAt: now,
				updatedAt: now
			})
			.returning(SP_COLUMNS);

		await invalidateCache('/api/service-providers');
		return json(row, { status: 201 });
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : '';
		if (message.includes('UNIQUE constraint')) {
			return json({ error: 'Service provider with this slug already exists' }, { status: 409 });
		}
		return json({ error: message || 'Internal error' }, { status: 500 });
	}
};
