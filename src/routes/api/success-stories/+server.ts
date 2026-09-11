import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { successStories } from '#lib/server/db/schema.js';
import { eq, and, desc, sql } from 'drizzle-orm';
import { cachedQuery, cacheMedium, invalidateCache, queryCacheKey } from '#lib/server/cache.js';
import { getSession } from '#lib/server/auth.js';
import { z } from 'zod';

const storySchema = z.object({
	slug: z.string().min(3).max(200).regex(/^[a-z0-9-]+$/, 'slug must be lowercase letters, numbers, hyphens'),
	title: z.string().min(5).max(200),
	excerpt: z.string().max(500).optional().nullable(),
	body: z.string().min(20, 'Story body must be at least 20 characters').max(20000),
	supplierSlug: z.string().max(200).optional().nullable(),
	buyerCountry: z.string().max(200).optional().nullable(),
	dealValue: z.string().max(200).optional().nullable(),
	image: z.string().max(500).optional().nullable()
});

// ==================== GET: published stories (public) ====================
export const GET: RequestHandler = async (event) => {
	const { url } = event;
	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	try {
		const requestedStatus = url.searchParams.get('status');
		// status=all → admin overview (session required, NEVER cached —
		// edge cache is anonymous-shared); otherwise default published.
		let statusFilter: string | null = requestedStatus || 'published';
		if (requestedStatus === 'all') {
			const session = await getSession(event);
			if (!session) return json({ error: 'Unauthorized' }, { status: 401 });
			statusFilter = null;
		}

		const runQuery = async () => {
				const limit = Math.min(Number(url.searchParams.get('limit')) || 20, 100);
				const offset = Number(url.searchParams.get('offset')) || 0;
				const supplierSlug = url.searchParams.get('supplierSlug') || undefined;

				const conditions: any[] = [];
				if (statusFilter) conditions.push(eq(successStories.status, statusFilter));
				if (supplierSlug) conditions.push(eq(successStories.supplierSlug, supplierSlug));
				const where = conditions.length > 1 ? and(...conditions) : (conditions[0] ?? undefined);

				const [countResult] = await db
					.select({ count: sql<number>`count(*)` })
					.from(successStories)
					.where(where);
				const rows = await db
					.select({
						slug: successStories.slug,
						title: successStories.title,
						excerpt: successStories.excerpt,
						supplierSlug: successStories.supplierSlug,
						buyerCountry: successStories.buyerCountry,
						dealValue: successStories.dealValue,
						image: successStories.image,
						createdAt: successStories.createdAt
					})
					.from(successStories)
					.where(where)
					.orderBy(desc(successStories.createdAt))
					.limit(limit)
					.offset(offset);
				return { items: rows, total: countResult?.count ?? 0 };
			};

			const data =
				statusFilter === null
					? await runQuery()
					: await cachedQuery(url.toString(), runQuery, { ...cacheMedium(), cacheKey: queryCacheKey(url) });

			return json(data);
	} catch (e: any) {
		return json({ error: e?.message ?? 'Failed' }, { status: 500 });
	}
};

// ==================== POST: publish a story (admin session only) ====================
// Stories are editorial content — only signed-in admins may publish. The
// admin UI lives at /admin/stories; supplier-submitted drafts arrive later.
export const POST: RequestHandler = async (event) => {
	const { request } = event;
	const session = await getSession(event);
	if (!session?.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	// Admin gate: caller must be in the admin allowlist (same rule as dashboard).
	const adminEmails = (getBindings().ADMIN_EMAILS ?? '').split(',').map((s: string) => s.trim().toLowerCase());
	const email = String((session.user as any).email ?? '').toLowerCase();
	if (!adminEmails.includes(email)) return json({ error: 'Forbidden' }, { status: 403 });

	const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
	const parsed = storySchema.safeParse(body ?? {});
	if (!parsed.success) {
		return json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
	}

	try {
		const now = new Date();
		const [row] = await db
			.insert(successStories)
			.values({
				slug: parsed.data.slug,
				title: parsed.data.title.trim(),
				excerpt: parsed.data.excerpt || null,
				body: parsed.data.body,
				supplierSlug: parsed.data.supplierSlug || null,
				buyerCountry: parsed.data.buyerCountry || null,
				dealValue: parsed.data.dealValue || null,
				image: parsed.data.image || null,
				status: 'published',
				createdAt: now,
				updatedAt: now
			})
			.returning({ slug: successStories.slug });

		await invalidateCache('/api/success-stories');
		return json({ slug: row.slug }, { status: 201 });
	} catch (e: any) {
		return json({ error: e?.message ?? 'Failed to publish' }, { status: 500 });
	}
};
