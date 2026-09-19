// Zod schemas for site settings — Project Rules §6.1 / §6.4.
//
// `src/routes/admin/settings` and `src/routes/api/settings` are the only
// consumers. The D1 `site_settings` table is a key/value store (`key` TEXT PK,
// `value` TEXT NOT NULL), so the typed object below is serialised to one row
// per field: booleans become 'true' / 'false' strings.

import { z } from 'zod';

const text = (max: number) => z.string().trim().max(max);

export const siteSettingsSchema = z.object({
	siteName: text(80).min(1, 'Site name is required.'),
	tagline: text(200).min(1, 'Tagline is required.'),
	supportEmail: z.email('Enter a valid email address.'),
	contactEmail: z.email('Enter a valid email address.'),
	enableDemoNotice: z.boolean({ error: 'Demo notice must be true or false.' }),
	enableMaintenanceMode: z.boolean({ error: 'Maintenance mode must be true or false.' })
});

export type SiteSettingsForm = z.infer<typeof siteSettingsSchema>;

export const DEFAULT_SITE_SETTINGS: SiteSettingsForm = {
	siteName: 'HalalNeo',
	tagline: 'Halal trade intelligence for buyers and suppliers',
	supportEmail: 'support@halalneo.com',
	contactEmail: 'support@halalneo.com',
	enableDemoNotice: true,
	enableMaintenanceMode: false
};

/** Keys a settings form is allowed to persist (typed object fields + extra editorial keys). */
export const SETTINGS_KEYS = [
	'siteName',
	'tagline',
	'supportEmail',
	'contactEmail',
	'enableDemoNotice',
	'enableMaintenanceMode',
	'siteDescription',
	'logoUrl',
	'contactPhone',
	'businessAddress',
	'businessHours',
	'businessEmail'
] as const;
export type SettingKey = (typeof SETTINGS_KEYS)[number];

/** Legacy single-key PUT body: `{ key, value }`. */
export const settingKeyValueSchema = z.object({
	key: z.enum(SETTINGS_KEYS, { error: 'Unknown setting key.' }),
	value: z.union([z.string().max(2000, 'Setting value is too long.'), z.boolean()])
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
export type SettingKeyValue = z.infer<typeof settingKeyValueSchema>;

export interface SiteSettingsResponse {
	settings: SiteSettingsForm;
	items: { key: string; value: string }[];
}

export interface SettingRow {
	key: string;
	value: string;
}

/** Serialise the typed settings object to `site_settings` rows. */
export function settingsToRows(settings: SiteSettingsForm): SettingRow[] {
	return Object.entries(settings).map(([key, value]) => ({
		key,
		value: typeof value === 'boolean' ? String(value) : value
	}));
}

/** Read `site_settings` rows back into the typed object, defaults filling gaps. */
export function settingsFromRows(rows: SettingRow[]): SiteSettingsForm {
	const byKey = new Map(rows.map((r) => [r.key, r.value]));
	const bool = (key: SettingKey): boolean => byKey.get(key) === 'true';
	return {
		siteName: byKey.get('siteName') || DEFAULT_SITE_SETTINGS.siteName,
		tagline: byKey.get('tagline') || DEFAULT_SITE_SETTINGS.tagline,
		supportEmail: byKey.get('supportEmail') || DEFAULT_SITE_SETTINGS.supportEmail,
		contactEmail: byKey.get('contactEmail') || DEFAULT_SITE_SETTINGS.contactEmail,
		enableDemoNotice: byKey.has('enableDemoNotice')
			? bool('enableDemoNotice')
			: DEFAULT_SITE_SETTINGS.enableDemoNotice,
		enableMaintenanceMode: byKey.has('enableMaintenanceMode')
			? bool('enableMaintenanceMode')
			: DEFAULT_SITE_SETTINGS.enableMaintenanceMode
	};
}
