import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { follows, suppliers } from '#lib/server/db/schema.js';
import { eq, and, sql } from 'drizzle-orm';
import { invalidateCache } from '#lib/server/cache.js';
import { getSession } from '#lib/server/auth.js';
import { z } from 'zod';

const followSchema = z.object({ supplierSlug: z.string().min(1).max(200) });

// ==================== GET ====================
// ?countFor=<slug> → public follower count (no auth).
// ?supplierSlug=<slug> → my following state (login).
// (none) → my follows list with supplier info (login).
export const GET: RequestHandler = async (event) => {
	const { url } = event;

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const countFor = url.searchParams.get('countFor');
	if (countFor) {
		try {
			const [r] = await db
				.select({ n: sql<number>`count(*)` })
				.from(follows)
				.where(eq(follows.supplierSlug, countFor));
			return json({ count: r?.n ?? 0 });
		} catch (e: any) {
			return json({ error: e?.message ?? 'Failed' }, { status: 500 });
		}
	}

	const session = await getSession(event);
	const userId = (session?.user as any)?.id as string | undefined;
	if (!userId) return json({ error: 'Unauthorized' }, { status: 401 });

	const supplierSlug = url.searchParams.get('supplierSlug') || undefined;
	try {
		if (supplierSlug) {
			const rows = await db
				.select({ supplierSlug: follows.supplierSlug })
				.from(follows)
				.where(and(eq(follows.userId, userId), eq(follows.supplierSlug, supplierSlug)))
				.limit(1);
			return json({ following: rows.length > 0 });
		}
		const rows = await db
			.select({
				supplierSlug: follows.supplierSlug,
				name: suppliers.name,
				country: suppliers.country,
				logoInitials: suppliers.logoInitials,
				createdAt: follows.createdAt
			})
			.from(follows)
			.leftJoin(suppliers, eq(follows.supplierSlug, suppliers.slug))
			.where(eq(follows.userId, userId));
		return json({ items: rows });
	} catch (e: any) {
		return json({ error: e?.message ?? 'Failed' }, { status: 500 });
	}
};

// ==================== POST: follow ====================
export const POST: RequestHandler = async (event) => {
	const { request } = event;
	const session = await getSession(event);
	const userId = (session?.user as any)?.id as string | undefined;
	if (!userId) return json({ error: 'Please sign in to follow suppliers.' }, { status: 401 });

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
	const parsed = followSchema.safeParse(body ?? {});
	if (!parsed.success) return json({ error: 'supplierSlug is required' }, { status: 400 });

	try {
		await db
			.insert(follows)
			.values({ userId, supplierSlug: parsed.data.supplierSlug, createdAt: new Date() })
			.onConflictDoNothing();
		await invalidateCache('/api/follows');
		return json({ following: true }, { status: 201 });
	} catch (e: any) {
		return json({ error: e?.message ?? 'Failed' }, { status: 500 });
	}
};

// ==================== DELETE: unfollow (?supplierSlug=) ====================
export const DELETE: RequestHandler = async (event) => {
	const { url } = event;
	const session = await getSession(event);
	const userId = (session?.user as any)?.id as string | undefined;
	if (!userId) return json({ error: 'Unauthorized' }, { status: 401 });

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const supplierSlug = url.searchParams.get('supplierSlug');
	if (!supplierSlug) return json({ error: 'supplierSlug is required' }, { status: 400 });

	try {
		await db
			.delete(follows)
			.where(and(eq(follows.userId, userId), eq(follows.supplierSlug, supplierSlug)));
		await invalidateCache('/api/follows');
		return json({ following: false });
	} catch (e: any) {
		return json({ error: e?.message ?? 'Failed' }, { status: 500 });
	}
};
