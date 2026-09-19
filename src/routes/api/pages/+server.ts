import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseQuery } from '#lib/server/db/api-helpers.js';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { pages } from '#lib/server/db/schema.js';
import { pageListColumns } from '#lib/server/db/projections.js';
import { and, eq, like, sql } from 'drizzle-orm';
import { cachedQuery, cacheMedium, invalidateCache, queryCacheKey } from '#lib/server/cache.js';
import { requireAdmin } from '#lib/server/auth-guard.js';
import {
	PAGE_STATUSES,
	PAGE_TYPES,
	pageCreateSchema,
	slugifyPage,
	toJsonList,
	type PageStatus,
	type PageType
} from '#lib/schemas/pages.js';

type Db = NonNullable<ReturnType<typeof getDb>>;
type StatusFilter = PageStatus | 'all';

interface ListFilters {
	status: StatusFilter;
	type: PageType | 'invalid' | undefined;
	category: string | undefined;
	search: string | undefined;
}

function resolveStatusFilter(raw: string | null): StatusFilter {
	if (raw === 'all') return 'all';
	return PAGE_STATUSES.includes(raw as PageStatus) ? (raw as PageStatus) : 'published';
}

/**
 * `type` is a real enum in D1, so an unknown value (`faq`) can never match.
 * Rather than casting it into the enum we mark it invalid and return an empty
 * page — same result, no lying to the type system.
 */
function resolveTypeFilter(raw: string | null): PageType | 'invalid' | undefined {
	if (!raw) return undefined;
	return PAGE_TYPES.includes(raw as PageType) ? (raw as PageType) : 'invalid';
}

async function queryList(db: Db, filters: ListFilters, limit: number, offset: number) {
	if (filters.type === 'invalid') {
		return { items: [], total: 0, limit, offset };
	}

	const conditions = [];
	if (filters.search) conditions.push(like(pages.title, `%${filters.search}%`));
	if (filters.type) conditions.push(eq(pages.type, filters.type));
	if (filters.category) conditions.push(eq(pages.category, filters.category));
	if (filters.status !== 'all') conditions.push(eq(pages.status, filters.status));
	const where = conditions.length ? and(...conditions) : undefined;

	const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(pages).where(where);

	const rows = await db
		.select(pageListColumns)
		.from(pages)
		.where(where)
		.orderBy(sql`${pages.updatedAt} DESC`)
		.limit(limit)
		.offset(offset);

	return { items: rows, total: countResult?.count ?? 0, limit, offset };
}

export const GET: RequestHandler = async (event) => {
	const { url } = event;
	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const { limit, offset, search } = parseQuery(url);
	const filters: ListFilters = {
		status: resolveStatusFilter(url.searchParams.get('status')),
		type: resolveTypeFilter(url.searchParams.get('type')),
		category: url.searchParams.get('category') || undefined,
		search
	};

	try {
		// Admin overview (draft + archived included): requires an allowlisted
		// admin and is never cached, so unpublished content cannot leak
		// through the shared edge cache.
		if (filters.status === 'all') {
			const denied = await requireAdmin(event);
			if (denied) return denied;
			const data = await queryList(db, filters, limit, offset);
			return json(data, { headers: { 'Cache-Control': 'no-store' } });
		}

		const data = await cachedQuery(url.toString(), () => queryList(db, filters, limit, offset), {
			...cacheMedium(),
			cacheKey: queryCacheKey(url)
		});

		return json(data);
	} catch (error: unknown) {
		return json(
			{ error: error instanceof Error ? error.message : 'Failed' },
			{ status: 500 }
		);
	}
};

export const POST: RequestHandler = async (event) => {
	const denied = await requireAdmin(event);
	if (denied) return denied;

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const body = (await event.request.json().catch(() => null)) as unknown;
	if (!body) return json({ error: 'Request body is required' }, { status: 400 });

	const parsed = pageCreateSchema.safeParse(body);
	if (!parsed.success) {
		return json(
			{ error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
			{ status: 400 }
		);
	}

	const slug = parsed.data.slug?.trim() || slugifyPage(parsed.data.title);
	if (!slug) {
		return json(
			{ error: 'Validation failed', details: { title: ['Title is required.'] } },
			{ status: 400 }
		);
	}

	const now = new Date();
	const values: typeof pages.$inferInsert = {
		slug,
		title: parsed.data.title,
		type: parsed.data.type,
		excerpt: parsed.data.excerpt || null,
		body: parsed.data.body || null,
		author: parsed.data.author || null,
		category: parsed.data.category || null,
		featuredImage: parsed.data.featuredImage || null,
		tags: toJsonList(parsed.data.tags),
		metaTitle: parsed.data.metaTitle || null,
		metaDescription: parsed.data.metaDescription || null,
		keywords: toJsonList(parsed.data.keywords),
		status: parsed.data.status,
		views: 0,
		// A page only carries a publication timestamp once it is live.
		publishedAt: parsed.data.status === 'published' ? now : null,
		createdAt: now,
		updatedAt: now
	};

	try {
		const [row] = await db
			.insert(pages)
			.values(values)
			.returning({ slug: pages.slug, status: pages.status });
		await invalidateCache('/api/pages', `/api/pages/${slug}`);
		return json({ slug: row.slug, status: row.status }, { status: 201 });
	} catch (error: unknown) {
		if (error instanceof Error && error.message.includes('UNIQUE constraint')) {
			return json({ error: 'A page with this slug already exists' }, { status: 409 });
		}
		return json(
			{ error: error instanceof Error ? error.message : 'Internal error' },
			{ status: 500 }
		);
	}
};
