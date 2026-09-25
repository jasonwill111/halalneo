// Zod schemas for the `categories` collection — Project Rules §6.4 / §3.4.
// Shared by the API routes (`/api/categories*`) and the admin CRUD page so the
// front-end and back-end validation rules can never drift apart.
// Field names, lengths and enums mirror `categories` in
// `src/lib/server/db/schema.ts` (D1) — keep both in sync (§6.1).

import { z } from 'zod';

/** `categories.status` — Drizzle enum: ['active', 'inactive']. */
export const CATEGORY_STATUSES = ['active', 'inactive'] as const;
export const categoryStatusSchema = z.enum(CATEGORY_STATUSES);
export type CategoryStatus = z.infer<typeof categoryStatusSchema>;

/** Slug-shaped text column (`slug` / `parent_slug`). */
const slug = z
	.string()
	.trim()
	.min(1, 'Slug is required.')
	.max(200, 'Slug must be 200 characters or fewer.')
	.regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers and dashes.');

const text = (max: number, label: string) =>
	z.string().trim().max(max, `${label} must be ${max} characters or fewer.`);

/** Columns shared by create + update (everything except the immutable `slug` PK). */
const categoryFields = {
	name: z
		.string()
		.trim()
		.min(1, 'Name is required.')
		.max(200, 'Name must be 200 characters or fewer.'),
	description: text(5000, 'Description').nullable().optional(),
	parentSlug: slug.nullable().optional(),
	icon: text(100, 'Icon').nullable().optional(),
	status: categoryStatusSchema.nullable().optional(),
	sortOrder: z
		.number()
		.int('Sort order must be a whole number.')
		.min(0, 'Sort order cannot be negative.')
		.max(9999, 'Sort order must be 9999 or lower.')
		.nullable()
		.optional(),
	metaTitle: text(60, 'Meta title').nullable().optional(),
	metaDescription: text(160, 'Meta description').nullable().optional(),
	keywords: text(500, 'Keywords').nullable().optional()
};

/**
 * Full-record payload for POST /api/categories.
 * The admin form always submits every field; blanks are normalised to `null`
 * client-side so the nullable DB columns stay clean.
 */
export const categoryCreateSchema = z
	.object({ slug, ...categoryFields })
	.refine((d) => !d.slug || !d.parentSlug || d.slug !== d.parentSlug, {
		path: ['parentSlug'],
		message: 'A category cannot be its own parent.'
	});

/**
 * Full-record payload for PUT /api/categories/[slug].
 * `slug` is the primary key and is immutable, so it lives in the path only;
 * the handler re-runs the self-parent guard against that path slug.
 */
export const categoryUpdateSchema = z.object(categoryFields);

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;

/** Row shape returned by the projected GET endpoints (dates are ISO strings over the wire). */
export interface CategoryRecord {
	slug: string;
	name: string;
	description: string | null;
	parentSlug: string | null;
	icon: string | null;
	status: CategoryStatus | null;
	sortOrder: number | null;
	metaTitle: string | null;
	metaDescription: string | null;
	keywords: string | null;
	createdAt?: string | null;
	updatedAt?: string | null;
}

/** List response envelope shared by client and server. */
export interface CategoryListResponse {
	items: CategoryRecord[];
	total: number;
	limit: number;
	offset: number;
}
