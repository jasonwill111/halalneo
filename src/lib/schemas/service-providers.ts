// Zod schemas for the `service_providers` collection — Project Rules §6.4 / §3.4.
// Shared by `/api/service-providers*` and the admin CRUD page.
// Field names, lengths and enums mirror `serviceProviders` in
// `src/lib/server/db/schema.ts` (D1) — keep both in sync (§6.1).

import { z } from 'zod';

/** `service_providers.type` — Drizzle enum. */
export const SERVICE_PROVIDER_TYPES = [
	'certification',
	'logistics',
	'finance',
	'payment',
	'insurance',
	'consulting'
] as const;
export const serviceProviderTypeSchema = z.enum(SERVICE_PROVIDER_TYPES);
export type ServiceProviderType = z.infer<typeof serviceProviderTypeSchema>;

/** `service_providers.status` — Drizzle enum: ['active', 'pending', 'suspended']. */
export const SERVICE_PROVIDER_STATUSES = ['active', 'pending', 'suspended'] as const;
export const serviceProviderStatusSchema = z.enum(SERVICE_PROVIDER_STATUSES);
export type ServiceProviderStatus = z.infer<typeof serviceProviderStatusSchema>;

/** Human-readable labels for the admin select + table. */
export const SERVICE_PROVIDER_TYPE_LABELS: Record<ServiceProviderType, string> = {
	certification: 'Certification',
	logistics: 'Logistics',
	finance: 'Finance',
	payment: 'Payment',
	insurance: 'Insurance',
	consulting: 'Consulting'
};

const slug = z
	.string()
	.trim()
	.min(1, 'Slug is required.')
	.max(200, 'Slug must be 200 characters or fewer.')
	.regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers and dashes.');

const optionalText = (max: number, label: string) =>
	z.string().trim().max(max, `${label} must be ${max} characters or fewer.`).nullable().optional();

/** Full-record payload for POST /api/service-providers. */
export const serviceProviderCreateSchema = z.object({
	slug,
	name: z
		.string()
		.trim()
		.min(1, 'Name is required.')
		.max(200, 'Name must be 200 characters or fewer.'),
	type: serviceProviderTypeSchema,
	country: z
		.string()
		.trim()
		.min(1, 'Country is required.')
		.max(100, 'Country must be 100 characters or fewer.'),
	description: optionalText(5000, 'Description'),
	website: optionalText(500, 'Website'),
	email: z
		.string()
		.trim()
		.max(200, 'Email must be 200 characters or fewer.')
		.email('Enter a valid email address.')
		.nullable()
		.optional(),
	phone: optionalText(50, 'Phone'),
	whatsapp: optionalText(50, 'WhatsApp'),
	line: optionalText(100, 'LINE'),
	rating: z
		.number()
		.min(0, 'Rating must be between 0 and 5.')
		.max(5, 'Rating must be between 0 and 5.')
		.nullable()
		.optional(),
	status: serviceProviderStatusSchema.nullable().optional(),
	metaTitle: optionalText(60, 'Meta title'),
	metaDescription: optionalText(160, 'Meta description'),
	keywords: optionalText(500, 'Keywords')
});

/**
 * Full-record payload for PUT /api/service-providers/[slug].
 * `slug` is the primary key and is immutable, so it lives in the path only.
 */
export const serviceProviderUpdateSchema = serviceProviderCreateSchema.omit({ slug: true });

export type ServiceProviderCreateInput = z.infer<typeof serviceProviderCreateSchema>;
export type ServiceProviderUpdateInput = z.infer<typeof serviceProviderUpdateSchema>;

/** Row shape returned by the projected GET endpoints (dates are ISO strings over the wire). */
export interface ServiceProviderRecord {
	slug: string;
	name: string;
	type: ServiceProviderType;
	country: string;
	description: string | null;
	website: string | null;
	email: string | null;
	phone: string | null;
	whatsapp: string | null;
	line: string | null;
	rating: number | null;
	status: ServiceProviderStatus | null;
	metaTitle: string | null;
	metaDescription: string | null;
	keywords: string | null;
	createdAt?: string | null;
	updatedAt?: string | null;
}

/** List response envelope shared by client and server. */
export interface ServiceProviderListResponse {
	items: ServiceProviderRecord[];
	total: number;
	limit: number;
	offset: number;
}
