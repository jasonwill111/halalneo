import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { siteSettings } from '#lib/server/db/schema.js';
import { eq, sql } from 'drizzle-orm';
import { cachedQuery, cacheLong, invalidateCache } from '#lib/server/cache.js';
import { getSession } from '#lib/server/auth.js';
import { requireAdmin } from '#lib/server/auth-guard.js';
import {
	settingKeyValueSchema,
	settingsFromRows,
	settingsToRows,
	siteSettingsSchema,
	type SettingRow,
	type SiteSettingsForm
} from '#lib/schemas/settings.js';

const PUBLIC_SETTING_KEYS = ['siteName', 'siteDescription', 'logoUrl', 'contactEmail'];

const rowColumns = {
	key: siteSettings.key,
	value: siteSettings.value,
	updatedAt: siteSettings.updatedAt
};

async function readRows(db: NonNullable<ReturnType<typeof getDb>>): Promise<SettingRow[]> {
	const rows = await db.select(rowColumns).from(siteSettings);
	return rows.map((r) => ({ key: r.key, value: r.value }));
}

export const GET: RequestHandler = async (event) => {
	const { url } = event;
	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const key = url.searchParams.get('key');

	if (key) {
		const row = await cachedQuery(
			url.toString(),
			async () => {
				const [row] = await db
					.select(rowColumns)
					.from(siteSettings)
					.where(eq(siteSettings.key, key))
					.limit(1);
				return row ?? null;
			},
			{ ...cacheLong(), cacheKey: `settings:${key}` }
		);
		if (!row) return json({ error: 'Setting not found' }, { status: 404 });
		return json(row);
	}

	const session = await getSession(event);

	// Anonymous: only public keys, edge-cacheable.
	if (!session) {
		const data = await cachedQuery(
			url.toString(),
			async () => {
				const rows = (await readRows(db)).filter((r) => PUBLIC_SETTING_KEYS.includes(r.key));
				return { settings: settingsFromRows(rows), items: rows };
			},
			{ ...cacheLong(), cacheKey: 'settings:public' }
		);
		return json(data);
	}

	// Signed-in: every key, including editorial + flag settings. `no-store`
	// because the D1 cache entry is shared across users inside one isolate.
	try {
		const rows = await readRows(db);
		const settings: SiteSettingsForm = settingsFromRows(rows);
		return json({ settings, items: rows }, { headers: { 'Cache-Control': 'no-store' } });
	} catch (error: unknown) {
		return json(
			{ error: error instanceof Error ? error.message : 'Query failed' },
			{ status: 500 }
		);
	}
};

/**
 * Persist settings. Two body shapes are accepted:
 *  - the typed form object (`{ siteName, tagline, ... }`) from admin/settings
 *  - the legacy single-key `{ key, value }` shape still used by older callers
 * Both paths are admin-only and Zod-validated.
 */
export const PUT: RequestHandler = async (event) => {
	const denied = await requireAdmin(event);
	if (denied) return denied;

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const body = (await event.request.json().catch(() => null)) as unknown;
	if (!body) return json({ error: 'Request body is required' }, { status: 400 });

	const typed = siteSettingsSchema.safeParse(body);
	let rows: SettingRow[];

	if (typed.success) {
		rows = settingsToRows(typed.data);
	} else {
		const legacy = settingKeyValueSchema.safeParse(body);
		if (!legacy.success) {
			// Report whichever shape the caller most likely intended: the typed
			// form errors when form fields are present, else the key/value ones.
			const formDetails = typed.error.flatten().fieldErrors;
			const hasFormFields = Object.values(formDetails).some((v) => v !== undefined);
			const details = hasFormFields ? formDetails : legacy.error.flatten().fieldErrors;
			return json({ error: 'Validation failed', details }, { status: 400 });
		}
		rows = [{ key: legacy.data.key, value: String(legacy.data.value) }];
	}

	const now = new Date();

	try {
		await db
			.insert(siteSettings)
			.values(rows.map((row) => ({ key: row.key, value: row.value, updatedAt: now })))
			.onConflictDoUpdate({
				target: siteSettings.key,
				set: { value: sql`excluded.value`, updatedAt: now }
			});
		await invalidateCache('/api/settings');
		const saved = await readRows(db);
		return json({ settings: settingsFromRows(saved), items: saved });
	} catch (error: unknown) {
		return json(
			{ error: error instanceof Error ? error.message : 'Update failed' },
			{ status: 500 }
		);
	}
};
