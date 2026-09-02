import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDbFromPlatform, parseQuery } from '#lib/server/db/api-helpers.js';
import { categories } from '#lib/server/db/schema.js';
import { and, eq, like, sql } from 'drizzle-orm';
import { cachedQuery, cacheMedium } from '#lib/server/cache.js';
import { getSession } from '#lib/server/auth.js';

export const GET: RequestHandler = async ({ platform, url }) => {
	const db = getDbFromPlatform(platform);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	try {
		const data = await cachedQuery(
			url.toString(),
			async () => {
				const { limit, offset, search } = parseQuery(url);
				const parentSlug = url.searchParams.get('parentSlug') || undefined;

				const conditions = [];
				if (search) conditions.push(like(categories.name, `%${search}%`));
				if (parentSlug) conditions.push(eq(categories.parentSlug, parentSlug));

				const where = conditions.length ? and(...conditions) : undefined;

				const [countResult] = await db
					.select({ count: sql<number>`count(*)` })
					.from(categories)
					.where(where);

				const rows = await db
					.select()
					.from(categories)
					.where(where)
					.limit(limit)
					.offset(offset);

				return { items: rows, total: countResult?.count ?? 0, limit, offset };
			},
			{ ...cacheMedium() }
		);

		return json(data);
	} catch (e: any) {
		return json({ error: e?.message ?? 'Failed' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, platform }) => {
	const session = await getSession({ platform, request, locals: {} } as any);
	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const db = getDbFromPlatform(platform);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
	if (!body?.slug || !body?.name) {
		return json({ error: 'slug, name are required' }, { status: 400 });
	}

	try {
		const [row] = await db.insert(categories).values(body as any).returning();
		return json(row, { status: 201 });
	} catch (e: any) {
		if (e?.message?.includes('UNIQUE constraint')) {
			return json({ error: 'Category with this slug already exists' }, { status: 409 });
		}
		return json({ error: e?.message ?? 'Internal error' }, { status: 500 });
	}
};
