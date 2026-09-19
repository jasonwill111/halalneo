// Zod schemas for content pages (landing + blog) — Project Rules §6.1 / §6.4.
//
// Shared by `src/routes/admin/pages` and `src/routes/api/pages`.
// Field list mirrors the Drizzle model (table `pages`), where `type` and
// `status` are real SQLite-text enums and `tags`/`keywords` are JSON-encoded
// TEXT columns (drizzle returns them as strings).

import { z } from 'zod';

export const PAGE_TYPES = ['landing', 'blog'] as const;
export type PageType = (typeof PAGE_TYPES)[number];

export const PAGE_STATUSES = ['published', 'draft', 'archived'] as const;
export type PageStatus = (typeof PAGE_STATUSES)[number];

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const text = (max: number) => z.string().trim().max(max);

/** `tags` / `keywords` accept a JSON array or a pre-encoded JSON string. */
const jsonList = () =>
	z
		.union([
			z.array(z.string().trim().min(1, 'List items cannot be empty.').max(200)).max(40),
			text(4000)
		])
		.optional();

export const pageCreateSchema = z.object({
	slug: text(200)
		.optional()
		.refine((s) => !s || SLUG_PATTERN.test(s), {
			message: 'Slug may only contain lowercase letters, numbers and dashes.'
		}),
	title: text(200).min(1, 'Title is required.'),
	type: z.enum(PAGE_TYPES, { error: 'Type must be landing or blog.' }),
	excerpt: text(500).optional(),
	body: text(200_000).optional(),
	author: text(160).optional(),
	category: text(120).optional(),
	featuredImage: text(500).optional(),
	tags: jsonList(),
	metaTitle: text(200).optional(),
	metaDescription: text(500).optional(),
	keywords: jsonList(),
	status: z.enum(PAGE_STATUSES, { error: 'Status must be published, draft or archived.' })
});

/** PUT payload: every field optional, enums still constrained. */
export const pageUpdateSchema = pageCreateSchema.partial();

export type PageInput = z.infer<typeof pageCreateSchema>;
export type PagePatch = z.infer<typeof pageUpdateSchema>;

export interface PageDto {
	slug: string;
	title: string;
	type: string;
	excerpt: string | null;
	body: string | null;
	author: string | null;
	category: string | null;
	featuredImage: string | null;
	tags: string | null;
	metaTitle?: string | null;
	metaDescription?: string | null;
	keywords?: string | null;
	status: string;
	views: number | null;
	publishedAt?: string | null;
	createdAt?: string | null;
	updatedAt?: string | null;
}

export interface PageListResponse {
	items: PageDto[];
	total: number;
	limit: number;
	offset: number;
}

export function slugifyPage(value: string): string {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/** Legacy rows can carry a `type` outside the enum — clamp for the form select. */
export function normalisePageType(value: string | null | undefined): PageType {
	return PAGE_TYPES.includes(value as PageType) ? (value as PageType) : 'landing';
}

/** Same for `status`: unknown values render as draft instead of breaking the select. */
export function normalisePageStatus(value: string | null | undefined): PageStatus {
	return PAGE_STATUSES.includes(value as PageStatus) ? (value as PageStatus) : 'draft';
}

/** Normalise a tags/keywords payload to the JSON TEXT the column stores. */
export function toJsonList(value: string[] | string | undefined): string | null {
	if (value === undefined) return null;
	if (Array.isArray(value)) {
		const cleaned = value.map((v) => v.trim()).filter(Boolean);
		return cleaned.length ? JSON.stringify(cleaned) : null;
	}
	const raw = value.trim();
	if (!raw) return null;
	try {
		const parsed: unknown = JSON.parse(raw);
		return Array.isArray(parsed) ? JSON.stringify(parsed.map((v) => String(v).trim())) : null;
	} catch {
		return null;
	}
}
