import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { successStories } from '#lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { cachedQuery, cacheLong, invalidateCache } from '#lib/server/cache.js';
import { getSession } from '#lib/server/auth.js';

export const GET: RequestHandler = async (event) => {
	const { params, url } = event;
	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	try {
		const row = await cachedQuery(
			url.toString(),
			async () => {
				const [r] = await db.select().from(successStories).where(eq(successStories.slug, params.slug)).limit(1);
				return r ?? null;
			},
			{ ...cacheLong() }
		);

		if (!row) return json({ error: 'Not found' }, { status: 404 });
		if (row.status !== 'published') {
			const session = await getSession(event);
			if (!session) return json({ error: 'Not found' }, { status: 404 });
		}
		return json(row);
	} catch (e: any) {
		return json({ error: e?.message ?? 'Failed' }, { status: 500 });
	}
};

// ==================== DELETE: remove a story (admin session only) ====================
// Mirrors the admin gate used by POST /api/success-stories (allowlist emails).
export const DELETE: RequestHandler = async (event) => {
	const { params } = event;
	const session = await getSession(event);
	if (!session?.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	// Admin gate: caller must be in the admin allowlist (same rule as publish).
	const adminEmails = (getBindings().ADMIN_EMAILS ?? '')
		.split(',')
		.map((s: string) => s.trim().toLowerCase());
	const email = String((session.user as any).email ?? '').toLowerCase();
	if (!adminEmails.includes(email)) return json({ error: 'Forbidden' }, { status: 403 });

	try {
		const [row] = await db
			.delete(successStories)
			.where(eq(successStories.slug, params.slug))
			.returning({ slug: successStories.slug });
		if (!row) return json({ error: 'Not found' }, { status: 404 });
		await invalidateCache('/api/success-stories');
		return json({ slug: row.slug });
	} catch (e: any) {
		return json({ error: e?.message ?? 'Failed to delete' }, { status: 500 });
	}
};
