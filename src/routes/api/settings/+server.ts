import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDbFromPlatform } from '#lib/server/db/api-helpers.js';
import { siteSettings } from '#lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { cachedQuery, cacheLong, invalidateCache } from '#lib/server/cache.js';
import { getSession } from '#lib/server/auth.js';

const PUBLIC_SETTING_KEYS = ['siteName', 'siteDescription', 'logoUrl', 'contactEmail'];

const ALLOWED_SETTINGS_KEYS = new Set([
	'siteName', 'siteDescription', 'logoUrl', 'contactEmail',
	'contactPhone', 'businessAddress', 'businessHours', 'businessEmail'
]);

export const GET: RequestHandler = async ({ platform, url, request }) => {
	const db = getDbFromPlatform(platform);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const key = url.searchParams.get('key');

	if (key) {
		const row = await cachedQuery(
			url.toString(),
			async () => {
				const [row] = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
				return row ?? null;
			},
			{ ...cacheLong(), cacheKey: `settings:${key}` }
		);
		if (!row) return json({ error: 'Setting not found' }, { status: 404 });
		return json(row);
	}

	const session = await getSession({ platform, request, locals: {} } as any);
	const data = await cachedQuery(
		url.toString(),
		async () => {
			const rows = await db.select().from(siteSettings);
			if (session) return { items: rows };
			return { items: rows.filter((r: any) => PUBLIC_SETTING_KEYS.includes(r.key)) };
		},
		{ ...cacheLong(), cacheKey: session ? 'settings:all' : 'settings:public' }
	);

	return json(data);
};

export const PUT: RequestHandler = async ({ request, platform }) => {
	const session = await getSession({ platform, request, locals: {} } as any);
	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const db = getDbFromPlatform(platform);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
	if (!body?.key || body.value === undefined) {
		return json({ error: 'key and value are required' }, { status: 400 });
	}

	if (!ALLOWED_SETTINGS_KEYS.has(body.key as string)) {
		return json({ error: 'Invalid setting key' }, { status: 400 });
	}

	if (typeof body.value !== 'string') {
		return json({ error: 'value must be a string' }, { status: 400 });
	}

	try {
		const now = new Date();
		const existing = await db
			.select()
			.from(siteSettings)
			.where(eq(siteSettings.key, body.key as string))
			.limit(1);

		if (existing.length > 0) {
			const [row] = await db
				.update(siteSettings)
				.set({ value: body.value as string, updatedAt: now })
				.where(eq(siteSettings.key, body.key as string))
				.returning();
			await invalidateCache('/api/settings');
			return json(row);
		}

		const [row] = await db
			.insert(siteSettings)
			.values({ key: body.key as string, value: body.value as string })
			.returning();
		await invalidateCache('/api/settings');
		return json(row, { status: 201 });
	} catch (e: any) {
		return json({ error: e?.message ?? 'Update failed' }, { status: 500 });
	}
};
