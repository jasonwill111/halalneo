import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseQuery } from '#lib/server/db/api-helpers.js';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { pages } from '#lib/server/db/schema.js';
import { and, desc, eq, like, or, sql } from 'drizzle-orm';
import { cachedQuery, cacheMedium, invalidateCache, queryCacheKey } from '#lib/server/cache.js';
import { requireAdmin } from '#lib/server/auth-guard.js';
import { BLOG_CATEGORY, blogPostCreateSchema, blogStatusSchema } from '#lib/schemas/blog.js';

/** Blog rows live in `pages` with type='blog' — never touch landing rows. */
const blogFilter = eq(pages.type, 'blog');

/** Public list projection (no body). */
const BLOG_PUBLIC_COLUMNS = {
	slug: pages.slug,
	title: pages.title,
	type: pages.type,
	excerpt: pages.excerpt,
	author: pages.author,
	category: pages.category,
	featuredImage: pages.featuredImage,
	tags: pages.tags,
	metaTitle: pages.metaTitle,
	metaDescription: pages.metaDescription,
	keywords: pages.keywords,
	status: pages.status,
	views: pages.views,
	publishedAt: pages.publishedAt,
	createdAt: pages.createdAt,
	updatedAt: pages.updatedAt
};

/** Admin (`status=all`) projection — adds the Markdown body for the editor. */
const BLOG_ADMIN_COLUMNS = {
	...BLOG_PUBLIC_COLUMNS,
	body: pages.body
};

export const GET: RequestHandler = async (event) => {
	const { url } = event;
	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	// parseQuery clamps limit to <=100 and defaults offset to 0 (§5.9).
	const { limit, offset, search } = parseQuery(url);

	// status=all → admin overview (allowlisted session required, NEVER cached —
	// the edge cache is anonymous-shared; see the no-store rule in hooks.server.ts).
	if (url.searchParams.get('status') === 'all') {
		const denied = await requireAdmin(event);
		if (denied) return denied;
		try {
			const where = search
				? (or(like(pages.title, `%${search}%`), like(pages.excerpt, `%${search}%`)) ?? undefined)
				: undefined;
			const [[countResult], rows] = await Promise.all([
				db.select({ count: sql<number>`count(*)` }).from(pages).where(and(blogFilter, where)),
				db
					.select(BLOG_ADMIN_COLUMNS)
					.from(pages)
					.where(and(blogFilter, where))
					.orderBy(desc(pages.updatedAt))
					.limit(limit)
					.offset(offset)
			]);
			return json(
				{ items: rows, total: countResult?.count ?? 0, limit, offset },
				{ headers: { 'Cache-Control': 'private, no-store' } }
			);
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : '';
			return json({ error: message || 'Failed' }, { status: 500 });
		}
	}

	// Early return on a bad filter, before touching D1 or the cache (§5.10).
	const rawStatus = url.searchParams.get('status') ?? 'published';
	const statusResult = blogStatusSchema.safeParse(rawStatus);
	if (!statusResult.success) {
		return json({ error: "status must be 'published', 'draft' or 'archived'" }, { status: 400 });
	}
	const status = statusResult.data;
	const category = url.searchParams.get('category') || undefined;

	try {
		const data = await cachedQuery(
			url.toString(),
			async () => {
				const conditions = [blogFilter, eq(pages.status, status)];
				if (search) conditions.push(like(pages.title, `%${search}%`));
				if (category) conditions.push(eq(pages.category, category));
				// pages is a small table (<500 rows) and idx_pages_type /
				// idx_pages_status / idx_pages_category cover the filters (§5.9).
				const where = and(...conditions);

				const [countResult] = await db
					.select({ count: sql<number>`count(*)` })
					.from(pages)
					.where(where);

				const rows = await db
					.select(BLOG_PUBLIC_COLUMNS)
					.from(pages)
					.where(where)
					.orderBy(desc(pages.updatedAt))
					.limit(limit)
					.offset(offset);

				return { items: rows, total: countResult?.count ?? 0, limit, offset };
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
	const parsed = blogPostCreateSchema.safeParse(body);
	if (!parsed.success) {
		return json(
			{ error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
			{ status: 400 }
		);
	}

	const now = new Date();
	try {
		const [row] = await db
			.insert(pages)
			.values({
				slug: parsed.data.slug,
				title: parsed.data.title,
				type: 'blog',
				category: BLOG_CATEGORY,
				excerpt: parsed.data.excerpt ?? null,
				body: parsed.data.body,
				author: parsed.data.author ?? null,
				featuredImage: parsed.data.featuredImage ?? null,
				tags: JSON.stringify(parsed.data.tags ?? []),
				metaTitle: parsed.data.metaTitle ?? null,
				metaDescription: parsed.data.metaDescription ?? null,
				keywords: parsed.data.keywords ?? null,
				status: parsed.data.status ?? 'draft',
				publishedAt: parsed.data.publishedAt ? new Date(`${parsed.data.publishedAt}T00:00:00.000Z`) : null,
				createdAt: now,
				updatedAt: now
			})
			.returning(BLOG_ADMIN_COLUMNS);

		await invalidateCache('/api/blog');
		return json(row, { status: 201 });
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : '';
		if (message.includes('UNIQUE constraint')) {
			return json(
				{ error: 'Validation failed', details: { slug: ['A page or post with this slug already exists'] } },
				{ status: 400 }
			);
		}
		return json({ error: message || 'Internal error' }, { status: 500 });
	}
};
