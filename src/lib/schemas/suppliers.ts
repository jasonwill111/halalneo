// Supplier Zod schema — the single validation source for BOTH sides of the
// suppliers data flow (development-rules.md §6.4: 前后端校验逻辑保持一致).
//
//  * `src/routes/admin/suppliers/+page.svelte` validates with `SupplierCreateSchema`
//    before fetch (FieldError + focusFirstInvalid), same rules as the server.
//  * `src/routes/api/suppliers/+server.ts` re-validates and answers
//    400 `{ error, details }` consumed by `mergeServerDetails`.
//  * `SupplierUpdateSchema` is `SupplierCreateSchema.partial()` so the admin
//    dashboard review flow can keep sending just `{ status, adminNotes }`.
//
// Keys map 1:1 onto `suppliers` in `src/lib/server/db/schema.ts`; unknown keys
// are stripped by Zod, so nothing outside this column set can be written.

import { z } from 'zod';

/** `suppliers.business_type` enum — must match schema.ts exactly. */
export const SUPPLIER_BUSINESS_TYPES = ['manufacturer', 'wholesaler', 'trader'] as const;

/** `suppliers.status` enum — must match schema.ts exactly (`rejected` is set by the
 *  admin application-review flow, not by the profile form). */
export const SUPPLIER_STATUSES = ['active', 'pending', 'suspended', 'rejected'] as const;

/** `supplier_certifications.status` values (same vocabulary as products.cert_status). */
export const CERT_STATUSES = ['certified', 'pending', 'not-certified', 'not-applicable'] as const;

export const SUPPLIER_LIMITS = {
	mainMarkets: 60,
	certifications: 20
} as const;

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,198}[a-z0-9])?$/;
const URL_RE = /^https?:\/\/\S{1,400}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d][\d\s().-]{2,39}$/;

function optionalText(max: number, label: string) {
	return z
		.string()
		.trim()
		.max(max, `${label} must be ${max} characters or fewer.`)
		.transform((v) => (v.length ? v : null))
		.nullable()
		.optional();
}

function optionalUrl(label: string) {
	return z
		.string()
		.trim()
		.max(1000, `${label} must be 1000 characters or fewer.`)
		.refine((v) => !v.length || URL_RE.test(v), `${label} must be a full http(s) URL.`)
		.transform((v) => (v.length ? v : null))
		.nullable()
		.optional();
}

function optionalPattern(re: RegExp, message: string, max: number, label: string) {
	return z
		.string()
		.trim()
		.max(max, `${label} must be ${max} characters or fewer.`)
		.refine((v) => !v.length || re.test(v), message)
		.transform((v) => (v.length ? v : null))
		.nullable()
		.optional();
}

/** JSON array column of short strings (main markets). */
const MainMarketsSchema = z
	.array(z.string().trim().max(120, 'Each market must be 120 characters or fewer.'))
	.max(SUPPLIER_LIMITS.mainMarkets, `At most ${SUPPLIER_LIMITS.mainMarkets} markets are allowed.`)
	.transform((rows) => {
		const kept = rows.map((r) => r.trim()).filter((r) => r.length > 0);
		return kept.length ? kept : null;
	})
	.nullable()
	.optional();

/** `suppliers.certifications` JSON column — managed by the supplier portal, so the
 *  admin profile form never sends it (partial update leaves it untouched). */
const CertificationsSchema = z
	.array(
		z.object({
			id: z.string().trim().max(64).optional(),
			bodyId: z.string().trim().max(200).optional().nullable(),
			bodyName: z.string().trim().min(1, 'Certifying body name is required.').max(200),
			scope: z.string().trim().max(500).optional().nullable(),
			status: z.enum(CERT_STATUSES),
			expiry: z.string().trim().max(30).optional().nullable(),
			number: z.string().trim().max(120).optional().nullable()
		})
	)
	.max(SUPPLIER_LIMITS.certifications, `At most ${SUPPLIER_LIMITS.certifications} certifications.`)
	.transform((rows) => (rows.length ? rows : null))
	.nullable()
	.optional();

export const SupplierCreateSchema = z.object({
	slug: z
		.string()
		.trim()
		.min(2, 'Slug is required.')
		.max(200, 'Slug must be 200 characters or fewer.')
		.regex(SLUG_RE, 'Slug may only contain lowercase letters, numbers and dashes.'),
	name: z
		.string()
		.trim()
		.min(2, 'Name is required.')
		.max(200, 'Name must be 200 characters or fewer.'),
	country: z
		.string()
		.trim()
		.min(2, 'Country is required.')
		.max(120, 'Country must be 120 characters or fewer.'),
	businessType: z.enum(SUPPLIER_BUSINESS_TYPES, {
		error: `Business type must be one of: ${SUPPLIER_BUSINESS_TYPES.join(', ')}.`
	}),
	status: z.enum(SUPPLIER_STATUSES, {
		error: `Status must be one of: ${SUPPLIER_STATUSES.join(', ')}.`
	}),
	isBrand: z.boolean(),
	logoInitials: optionalPattern(
		/^[A-Z0-9]{1,4}$/,
		'Logo initials must be 1-4 letters or digits.',
		8,
		'Logo initials'
	),
	description: optionalText(20000, 'Description'),
	coverImage: optionalUrl('Cover image URL'),
	website: optionalUrl('Website'),
	email: optionalPattern(EMAIL_RE, 'Enter a valid email address.', 200, 'Email'),
	phone: optionalPattern(PHONE_RE, 'Enter a valid phone number.', 40, 'Phone'),
	whatsapp: optionalPattern(PHONE_RE, 'Enter a valid phone number.', 40, 'WhatsApp'),
	line: optionalText(50, 'LINE ID'),
	yearEstablished: z
		.number({ error: 'Year established must be a number.' })
		.int('Year established must be a whole year.')
		.min(1900, 'Year established must be 1900 or later.')
		.max(
			new Date().getFullYear() + 1,
			`Year established cannot be later than ${new Date().getFullYear() + 1}.`
		)
		.nullable()
		.optional(),
	employeeCount: optionalText(120, 'Employee count'),
	productionCapacity: optionalText(200, 'Production capacity'),
	mainMarkets: MainMarketsSchema,
	certifications: CertificationsSchema,
	adminNotes: optionalText(2000, 'Admin notes'),
	metaTitle: optionalText(60, 'Meta title'),
	metaDescription: optionalText(160, 'Meta description'),
	keywords: optionalText(500, 'Keywords')
});

/** Partial update body (PATCH/PUT): absent keys are never written. */
export const SupplierUpdateSchema = SupplierCreateSchema.partial().omit({ slug: true });

export type SupplierCreateInput = z.infer<typeof SupplierCreateSchema>;
export type SupplierUpdateInput = z.infer<typeof SupplierUpdateSchema>;
export type SupplierBusinessType = (typeof SUPPLIER_BUSINESS_TYPES)[number];
export type SupplierStatus = (typeof SUPPLIER_STATUSES)[number];

/** Row shape returned by /api/suppliers/[slug] (JSON TEXT columns unparsed). */
export interface SupplierRow {
	slug: string;
	name: string;
	country: string;
	businessType: SupplierBusinessType;
	isBrand: boolean | null;
	status: SupplierStatus | null;
	logoInitials: string | null;
	description: string | null;
	coverImage: string | null;
	website: string | null;
	email: string | null;
	phone: string | null;
	whatsapp: string | null;
	line: string | null;
	yearEstablished: number | null;
	employeeCount: string | null;
	productionCapacity: string | null;
	mainMarkets: string | null;
	certifications: string | null;
	metaTitle: string | null;
	metaDescription: string | null;
	keywords: string | null;
	createdAt: string | number | null;
	updatedAt: string | number | null;
}

/** Lightweight projected row from `getSupplierListItems`. */
export interface SupplierListItem {
	slug: string;
	name: string;
	country: string;
	businessType: SupplierBusinessType | null;
	status: SupplierStatus | null;
	isBrand: boolean | null;
	logoInitials: string | null;
	description: string | null;
}

/** `PaginatedResult<T>` envelope used by every list endpoint. */
export interface SupplierListResponse {
	items: SupplierListItem[];
	total: number;
	limit: number;
	offset: number;
}

/** Raw form state accepted by `toSupplierPayload` (inputs are always strings). */
export interface SupplierFormState {
	slug: string;
	name: string;
	country: string;
	businessType: SupplierBusinessType;
	status: SupplierStatus;
	isBrand: boolean;
	logoInitials: string;
	description: string;
	coverImage: string;
	website: string;
	email: string;
	phone: string;
	whatsapp: string;
	line: string;
	yearEstablished: string;
	employeeCount: string;
	productionCapacity: string;
	mainMarkets: string;
	metaTitle: string;
	metaDescription: string;
	keywords: string;
}

/**
 * Build the wire payload from raw form state. Mirrors the server schema: empty
 * strings collapse to null in the schema transforms, and an unparsable year
 * stays NaN so Zod rejects it (field error) instead of silently storing 0.
 */
export function toSupplierPayload(input: SupplierFormState): SupplierCreateInput {
	const year = input.yearEstablished.trim();
	return {
		slug: input.slug.trim(),
		name: input.name.trim(),
		country: input.country.trim(),
		businessType: input.businessType,
		status: input.status,
		isBrand: input.isBrand,
		logoInitials: input.logoInitials,
		description: input.description,
		coverImage: input.coverImage,
		website: input.website,
		email: input.email,
		phone: input.phone,
		whatsapp: input.whatsapp,
		line: input.line,
		yearEstablished: year ? Number(year) : null,
		employeeCount: input.employeeCount,
		productionCapacity: input.productionCapacity,
		mainMarkets: input.mainMarkets
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean),
		metaTitle: input.metaTitle,
		metaDescription: input.metaDescription,
		keywords: input.keywords
	};
}

/** Defensive JSON TEXT parse — nulls, empty strings and bad JSON fall back. */
export function parseSupplierJson<T>(raw: unknown, fallback: T): T {
	if (raw == null) return fallback;
	if (typeof raw !== 'string') return raw as T;
	const trimmed = raw.trim();
	if (!trimmed) return fallback;
	try {
		return JSON.parse(trimmed) as T;
	} catch {
		return fallback;
	}
}

/** Up-to-2-letter avatar initials, used when the admin leaves the field blank. */
export function initialsFromName(name: string): string {
	return name
		.split(/\s+/)
		.map((p) => p.charAt(0))
		.filter(Boolean)
		.slice(0, 2)
		.join('')
		.toUpperCase();
}
