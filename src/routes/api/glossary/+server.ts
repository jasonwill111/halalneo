import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseQuery } from '#lib/server/db/api-helpers.js';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { pages } from '#lib/server/db/schema.js';
import { and, asc, eq, like, or, sql } from 'drizzle-orm';
import { cachedQuery, cacheMedium, invalidateCache, queryCacheKey } from '#lib/server/cache.js';
import { requireAdmin } from '#lib/server/auth-guard.js';
import { glossaryTermSchema, GLOSSARY_CATEGORY, glossarySlugFor } from '#lib/schemas/glossary.js';

/**
 * Glossary terms are `pages` rows (`type='landing'`, `category='glossary'`),
 * not a table of their own — see `#lib/schemas/glossary.ts` for the mapping.
 */
const glossaryFilter = and(eq(pages.type, 'landing'), eq(pages.category, GLOSSARY_CATEGORY));

/** Column projection mapped back onto the `{ term, definition }` UI shape (§5.9). */
const GLOSSARY_COLUMNS = {
	slug: pages.slug,
	term: pages.title,
	definition: pages.body,
	status: pages.status
};

export const GET: RequestHandler = async (event) => {
	const { url } = event;
	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	// parseQuery clamps limit to <=100 and defaults offset to 0 (§5.9).
	const { limit, offset, search } = parseQuery(url);
	const where = search
		? (and(glossaryFilter, or(like(pages.title, `%${search}%`), like(pages.body, `%${search}%`))) ??
			undefined)
		: (glossaryFilter ?? undefined);

	// status=all → admin overview, i.e. rows of every status (allowlisted session
	// required, NEVER cached — the edge cache is anonymous-shared).
	if (url.searchParams.get('status') === 'all') {
		const denied = await requireAdmin(event);
		if (denied) return denied;
		try {
			const [[countRow], rows] = await Promise.all([
				db
					.select({ count: sql<number>`count(*)` })
					.from(pages)
					.where(where),
				db
					.select(GLOSSARY_COLUMNS)
					.from(pages)
					.where(where)
					.orderBy(asc(pages.title))
					.limit(limit)
					.offset(offset)
			]);
			return json(
				{ items: rows, total: countRow?.count ?? 0, limit, offset },
				{ headers: { 'Cache-Control': 'private, no-store' } }
			);
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : '';
			return json({ error: message || 'Failed' }, { status: 500 });
		}
	}

	try {
		const data = await cachedQuery(
			url.toString(),
			async () => {
				// Glossary rows are a small subset of the <500-row `pages` table and
				// idx_pages_type / idx_pages_category cover the filter, so the LIKE
				// scan stays bounded (§5.9).
				const [[countRow], rows] = await Promise.all([
					db
						.select({ count: sql<number>`count(*)` })
						.from(pages)
						.where(and(where, eq(pages.status, 'published'))),
					db
						.select(GLOSSARY_COLUMNS)
						.from(pages)
						.where(and(where, eq(pages.status, 'published')))
						.orderBy(asc(pages.title))
						.limit(limit)
						.offset(offset)
				]);
				return { items: rows, total: countRow?.count ?? 0, limit, offset };
			},
			{ ...cacheMedium(), cacheKey: queryCacheKey(url) }
		);

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
	const parsed = glossaryTermSchema.safeParse(body);
	if (!parsed.success) {
		return json(
			{ error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
			{ status: 400 }
		);
	}

	const { term, definition } = parsed.data;
	const slug = glossarySlugFor(term);

	try {
		// Terms are addressed by name in the UI, so a case-insensitive duplicate
		// is a user-facing validation error, not a 500. One indexed lookup, done.
		const clash = await db
			.select({ slug: pages.slug })
			.from(pages)
			.where(and(glossaryFilter, sql`lower(${pages.title}) = lower(${term})`))
			.limit(1);
		if (clash.length > 0) {
			return json(
				{ error: 'Validation failed', details: { term: ['That term already exists'] } },
				{ status: 400 }
			);
		}

		const now = new Date();
		const [row] = await db
			.insert(pages)
			.values({
				slug,
				title: term,
				type: 'landing',
				category: GLOSSARY_CATEGORY,
				excerpt: definition,
				body: definition,
				keywords: term,
				metaTitle: term,
				// meta_description is an SEO snippet — the seed truncates nothing, but
				// 160 chars is the Google display limit, so the definition is clipped.
				metaDescription: definition.slice(0, 160),
				tags: JSON.stringify([term]),
				status: 'published',
				views: 0,
				createdAt: now,
				updatedAt: now
			})
			.returning(GLOSSARY_COLUMNS);

		// Evict this endpoint's cached lists and the public glossary page key
		// (`src/routes/glossary/+page.ts` reads /api/pages?category=glossary).
		await invalidateCache('/api/glossary', '/api/pages?category=glossary&limit=200');
		return json(row, { status: 201 });
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : '';
		if (message.includes('UNIQUE constraint')) {
			return json(
				{ error: 'Validation failed', details: { term: ['That term already exists'] } },
				{ status: 400 }
			);
		}
		return json({ error: message || 'Internal error' }, { status: 500 });
	}
};
