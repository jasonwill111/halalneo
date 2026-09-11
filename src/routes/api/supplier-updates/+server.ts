import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { supplierMembers, supplierUpdates } from '#lib/server/db/schema.js';
import { eq, and, desc, sql } from 'drizzle-orm';
import { cachedQuery, cacheMedium, invalidateCache, queryCacheKey } from '#lib/server/cache.js';
import { getSession } from '#lib/server/auth.js';
import { checkWeeklyQuota, resolvePlan } from '#lib/server/quotas.js';
import { z } from 'zod';

const updateSchema = z.object({
	supplierSlug: z.string().min(1).max(200),
	body: z.string().min(5, 'Update must be at least 5 characters').max(2000),
	image: z.string().max(500).optional().nullable()
});

// ==================== GET: updates feed (?supplierSlug=, public) ====================
export const GET: RequestHandler = async ({ url }) => {
	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	try {
		const data = await cachedQuery(
			url.toString(),
			async () => {
				const limit = Math.min(Number(url.searchParams.get('limit')) || 10, 50);
				const offset = Number(url.searchParams.get('offset')) || 0;
				const supplierSlug = url.searchParams.get('supplierSlug') || undefined;
				const status = url.searchParams.get('status') || 'active';

				const conditions = [eq(supplierUpdates.status, status)];
				if (supplierSlug) conditions.push(eq(supplierUpdates.supplierSlug, supplierSlug));
				const where = conditions.length > 1 ? and(...conditions) : conditions[0];

				const [countResult] = await db
					.select({ count: sql<number>`count(*)` })
					.from(supplierUpdates)
					.where(where);
				const rows = await db
					.select()
					.from(supplierUpdates)
					.where(where)
					.orderBy(desc(supplierUpdates.createdAt))
					.limit(limit)
					.offset(offset);
				return { items: rows, total: countResult?.count ?? 0 };
			},
			{ ...cacheMedium(), cacheKey: queryCacheKey(url) }
		);

		return json(data);
	} catch (e: any) {
		return json({ error: e?.message ?? 'Failed' }, { status: 500 });
	}
};

// ==================== POST: publish an update (member + weekly quota) ====================
export const POST: RequestHandler = async (event) => {
	const { request } = event;
	const session = await getSession(event);
	const userId = (session?.user as any)?.id as string | undefined;
	if (!userId) return json({ error: 'Please sign in as a supplier to post updates.' }, { status: 401 });

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
	const parsed = updateSchema.safeParse(body ?? {});
	if (!parsed.success) {
		return json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
	}

	const members = await db
		.select({ userId: supplierMembers.userId })
		.from(supplierMembers)
		.where(and(eq(supplierMembers.userId, userId), eq(supplierMembers.supplierSlug, parsed.data.supplierSlug)))
		.limit(1);
	if (members.length === 0) {
		return json({ error: 'Only team members of this supplier can post updates.' }, { status: 403 });
	}

	const quota = await checkWeeklyQuota(db, supplierUpdates, supplierUpdates.supplierSlug, parsed.data.supplierSlug, 'supplierUpdate', resolvePlan(userId));
	if (!quota.allowed) {
		return json(
			{ error: `Weekly update limit reached (${quota.limit}/week on the free plan). Upgrade for more.` },
			{ status: 429 }
		);
	}

	try {
		const now = new Date();
		const [row] = await db
			.insert(supplierUpdates)
			.values({
				supplierSlug: parsed.data.supplierSlug,
				body: parsed.data.body.trim(),
				image: parsed.data.image || null,
				status: 'active',
				createdAt: now,
				updatedAt: now
			})
			.returning({ id: supplierUpdates.id });

		await invalidateCache('/api/supplier-updates');
		return json({ id: row.id, remaining: quota.remaining - 1 }, { status: 201 });
	} catch (e: any) {
		return json({ error: e?.message ?? 'Failed to publish' }, { status: 500 });
	}
};
