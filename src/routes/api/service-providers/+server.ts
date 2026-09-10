import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseQuery } from '#lib/server/db/api-helpers.js';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { serviceProviders } from '#lib/server/db/schema.js';
import { and, eq, like, sql } from 'drizzle-orm';
import { cachedQuery, cacheMedium, invalidateCache, queryCacheKey } from '#lib/server/cache.js';
import { getSession } from '#lib/server/auth.js';

export const GET: RequestHandler = async ({ url }) => {
	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	try {
		const data = await cachedQuery(
			url.toString(),
			async () => {
				const { limit, offset, search } = parseQuery(url);
				const status = url.searchParams.get('status') || 'active';
				const type = url.searchParams.get('type') || undefined;
				const country = url.searchParams.get('country') || undefined;

				const conditions = [];
				if (search) conditions.push(like(serviceProviders.name, `%${search}%`));
				if (status) conditions.push(eq(serviceProviders.status, status as 'active' | 'pending' | 'suspended'));
				if (type) conditions.push(eq(serviceProviders.type, type as any));
				if (country) conditions.push(eq(serviceProviders.country, country));

				const where = conditions.length ? and(...conditions) : undefined;

				const [countResult] = await db
					.select({ count: sql<number>`count(*)` })
					.from(serviceProviders)
					.where(where);

				const rows = await db
					.select()
					.from(serviceProviders)
					.where(where)
					.limit(limit)
					.offset(offset);

				return { items: rows, total: countResult?.count ?? 0, limit, offset };
			},
			{ ...cacheMedium(), cacheKey: queryCacheKey(url) }
		);

		return json(data);
	} catch (e: any) {
		return json({ error: e?.message ?? 'Failed' }, { status: 500 });
	}
};

export const POST: RequestHandler = async (event) => {
	const { request } = event;
	const session = await getSession(event);
	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
	if (!body?.slug || !body?.name || !body?.type || !body?.country) {
		return json({ error: 'slug, name, type, country are required' }, { status: 400 });
	}

	try {
		const [row] = await db.insert(serviceProviders).values(body as any).returning();
		await invalidateCache('/api/service-providers');
		return json(row, { status: 201 });
	} catch (e: any) {
		if (e?.message?.includes('UNIQUE constraint')) {
			return json({ error: 'Service provider with this slug already exists' }, { status: 409 });
		}
		return json({ error: e?.message ?? 'Internal error' }, { status: 500 });
	}
};
