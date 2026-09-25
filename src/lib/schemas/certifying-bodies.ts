// Zod schemas for the `certifying_bodies` collection — Project Rules §6.4 / §3.4.
// Shared by `/api/certifying-bodies*` and the admin CRUD page.
// Field names, lengths and enums mirror `certifyingBodies` in
// `src/lib/server/db/schema.ts` (D1) — keep both in sync (§6.1).

import { z } from 'zod';

/**
 * `certifying_bodies.status` — Drizzle enum: ['active', 'pending', 'inactive'].
 * The legacy `CertifyingBody` client type only knew 'active' | 'inactive';
 * 'pending' is part of the DB contract and must stay selectable in the admin.
 */
export const CERTIFYING_BODY_STATUSES = ['active', 'pending', 'inactive'] as const;
export const certifyingBodyStatusSchema = z.enum(CERTIFYING_BODY_STATUSES);
export type CertifyingBodyStatus = z.infer<typeof certifyingBodyStatusSchema>;

/** URL-safe primary key (`certifying_bodies.id`, e.g. `jakim`). */
const bodyId = z
	.string()
	.trim()
	.min(1, 'Id is required.')
	.max(200, 'Id must be 200 characters or fewer.')
	.regex(/^[a-z0-9-]+$/, 'Id may only contain lowercase letters, numbers and dashes.');

/**
 * Full-record payload for POST /api/certifying-bodies.
 * An empty `id` lets the database generate a UUID primary key.
 */
export const certifyingBodyCreateSchema = z.object({
	id: bodyId.nullable().optional(),
	name: z
		.string()
		.trim()
		.min(1, 'Name is required.')
		.max(200, 'Name must be 200 characters or fewer.'),
	country: z
		.string()
		.trim()
		.min(1, 'Country is required.')
		.max(100, 'Country must be 100 characters or fewer.'),
	standard: z
		.string()
		.trim()
		.max(200, 'Standard must be 200 characters or fewer.')
		.nullable()
		.optional(),
	website: z
		.string()
		.trim()
		.max(500, 'Website must be 500 characters or fewer.')
		.nullable()
		.optional(),
	description: z
		.string()
		.trim()
		.max(5000, 'Description must be 5000 characters or fewer.')
		.nullable()
		.optional(),
	status: certifyingBodyStatusSchema.nullable().optional(),
	metaTitle: z
		.string()
		.trim()
		.max(60, 'Meta title must be 60 characters or fewer.')
		.nullable()
		.optional(),
	metaDescription: z
		.string()
		.trim()
		.max(160, 'Meta description must be 160 characters or fewer.')
		.nullable()
		.optional(),
	keywords: z
		.string()
		.trim()
		.max(500, 'Keywords must be 500 characters or fewer.')
		.nullable()
		.optional()
});

/**
 * Full-record payload for PUT /api/certifying-bodies/[id].
 * `id` is the primary key and is immutable, so it lives in the path only.
 */
export const certifyingBodyUpdateSchema = certifyingBodyCreateSchema.omit({ id: true });

export type CertifyingBodyCreateInput = z.infer<typeof certifyingBodyCreateSchema>;
export type CertifyingBodyUpdateInput = z.infer<typeof certifyingBodyUpdateSchema>;

/** Row shape returned by the projected GET endpoints (dates are ISO strings over the wire). */
export interface CertifyingBodyRecord {
	id: string;
	name: string;
	country: string;
	standard: string | null;
	website: string | null;
	description: string | null;
	status: CertifyingBodyStatus | null;
	metaTitle: string | null;
	metaDescription: string | null;
	keywords: string | null;
	createdAt?: string | null;
	updatedAt?: string | null;
}

/** List response envelope shared by client and server. */
export interface CertifyingBodyListResponse {
	items: CertifyingBodyRecord[];
	total: number;
	limit: number;
	offset: number;
}
