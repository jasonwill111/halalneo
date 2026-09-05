import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDbFromPlatform } from '#lib/server/db/api-helpers.js';
import { suppliers } from '#lib/server/db/schema.js';
import { cachedQuery, cacheMedium, invalidateCache } from '#lib/server/cache.js';
import { getSupplierListItems } from '#lib/server/queries/index.js';
import { getSession } from '#lib/server/auth.js';

export const GET: RequestHandler = async ({ platform, url }) => {
	const db = getDbFromPlatform(platform);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	try {
		// List view: project only the columns the UI needs (8 cols, not all 22).
		// Drops certifications/main_markets/cover_image/website/email/phone/etc.
		// from D1 rows-read + cache payload.
		const data = await cachedQuery(
			url.toString(),
			async () => {
				const limit = Math.min(Number(url.searchParams.get('limit')) || 20, 100);
				const offset = Number(url.searchParams.get('offset')) || 0;
				return getSupplierListItems(db, {
					limit,
					offset,
					search: url.searchParams.get('search') || undefined,
					status: url.searchParams.get('status') || undefined,
					country: url.searchParams.get('country') || undefined,
					businessType: url.searchParams.get('businessType') || undefined
				});
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
	if (!body?.slug || !body?.name || !body?.country || !body?.businessType) {
		return json({ error: 'slug, name, country, businessType are required' }, { status: 400 });
	}

	try {
		const [row] = await db.insert(suppliers).values(body as any).returning();
		await invalidateCache('/api/suppliers');
		return json(row, { status: 201 });
	} catch (e: any) {
		if (e?.message?.includes('UNIQUE constraint')) {
			return json({ error: 'Supplier with this slug already exists' }, { status: 409 });
		}
		return json({ error: e?.message ?? 'Internal error' }, { status: 500 });
	}
};
