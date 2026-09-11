import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { pageViews, products, promotions, buyingRequests, supplierMembers } from '#lib/server/db/schema.js';
import { eq, and, gte, desc, sql } from 'drizzle-orm';
import { getSession } from '#lib/server/auth.js';
import { z } from 'zod';

const beaconSchema = z.object({
	kind: z.enum(['supplier', 'product', 'promotion', 'rfq']),
	slug: z.string().min(1).max(300)
});

// ==================== POST: record a detail view (public beacon) ====================
// Primary awaited write for view counts — callers must NOT fire-and-forget
// (Workers may terminate the request before a detached write runs).
export const POST: RequestHandler = async ({ request }) => {
	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
	const parsed = beaconSchema.safeParse(body ?? {});
	if (!parsed.success) return json({ error: 'kind + slug required' }, { status: 400 });

	try {
		const now = new Date();
		await db.insert(pageViews).values({ kind: parsed.data.kind, slug: parsed.data.slug, createdAt: now });

		// Keep the denormalized `views` counters in step (list pages read them).
		if (parsed.data.kind === 'product') {
			await db
				.update(products)
				.set({ views: sql`${products.views} + 1` })
				.where(eq(products.slug, parsed.data.slug));
		} else if (parsed.data.kind === 'promotion') {
			await db
				.update(promotions)
				.set({ views: sql`${promotions.views} + 1` })
				.where(eq(promotions.id, parsed.data.slug));
		} else if (parsed.data.kind === 'rfq') {
			await db
				.update(buyingRequests)
				.set({ views: sql`${buyingRequests.views} + 1` })
				.where(eq(buyingRequests.id, parsed.data.slug));
		}
		return json({ ok: true });
	} catch {
		// Analytics must never break the page — swallow errors.
		return json({ ok: true });
	}
};

// ==================== GET: supplier analytics (member-only) ====================
// ?supplierSlug= → totals + 30-day daily series + top products by views.
export const GET: RequestHandler = async (event) => {
	const { url } = event;
	const session = await getSession(event);
	const userId = (session?.user as any)?.id as string | undefined;
	if (!userId) return json({ error: 'Unauthorized' }, { status: 401 });

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const supplierSlug = url.searchParams.get('supplierSlug');
	if (!supplierSlug) return json({ error: 'supplierSlug is required' }, { status: 400 });

	try {
		const members = await db
			.select({ userId: supplierMembers.userId })
			.from(supplierMembers)
			.where(and(eq(supplierMembers.userId, userId), eq(supplierMembers.supplierSlug, supplierSlug)))
			.limit(1);
		if (members.length === 0) return json({ error: 'Forbidden' }, { status: 403 });

		const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

		const [totals] = await db
			.select({ n: sql<number>`count(*)` })
			.from(pageViews)
			.where(and(eq(pageViews.kind, 'supplier'), eq(pageViews.slug, supplierSlug)));
		const [month] = await db
			.select({ n: sql<number>`count(*)` })
			.from(pageViews)
			.where(
				and(eq(pageViews.kind, 'supplier'), eq(pageViews.slug, supplierSlug), gte(pageViews.createdAt, since))
			);

		const daily = await db
			.select({
				day: sql<string>`date(${pageViews.createdAt} / 1000, 'unixepoch')`,
				n: sql<number>`count(*)`
			})
			.from(pageViews)
			.where(
				and(eq(pageViews.kind, 'supplier'), eq(pageViews.slug, supplierSlug), gte(pageViews.createdAt, since))
			)
			.groupBy(sql`date(${pageViews.createdAt} / 1000, 'unixepoch')`)
			.orderBy(sql`date(${pageViews.createdAt} / 1000, 'unixepoch')`);

		const productSlugs = await db
			.select({ slug: products.slug, name: products.name, views: products.views })
			.from(products)
			.where(eq(products.supplierSlug, supplierSlug))
			.orderBy(desc(products.views))
			.limit(5);

		return json({
			profileViewsTotal: totals?.n ?? 0,
			profileViews30d: month?.n ?? 0,
			daily: daily.map((d) => ({ day: d.day, views: d.n })),
			topProducts: productSlugs
		});
	} catch (e: any) {
		return json({ error: e?.message ?? 'Failed' }, { status: 500 });
	}
};
