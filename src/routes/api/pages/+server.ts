import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDbFromPlatform, parseQuery } from '#lib/server/db/api-helpers.js';
import { pages } from '#lib/server/db/schema.js';
import { and, eq, like, sql } from 'drizzle-orm';
import { cachedQuery, cacheMedium } from '#lib/server/cache.js';

export const GET: RequestHandler = async ({ platform, url }) => {
	const db = getDbFromPlatform(platform);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	try {
		const data = await cachedQuery(
			url.toString(),
			async () => {
				const { limit, offset, search } = parseQuery(url);
				const type = url.searchParams.get('type') || undefined;
				const category = url.searchParams.get('category') || undefined;

				const conditions = [];
				if (search) conditions.push(like(pages.title, `%${search}%`));
				if (type) conditions.push(eq(pages.type, type as 'landing' | 'blog'));
				if (category) conditions.push(eq(pages.category, category));

				const where = conditions.length ? and(...conditions) : undefined;

				const [countResult] = await db
					.select({ count: sql<number>`count(*)` })
					.from(pages)
					.where(where);

				const rows = await db
					.select()
					.from(pages)
					.where(where)
					.orderBy(sql`${pages.updatedAt} DESC`)
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
