// Shared Zod schema for blog posts (D1 table `pages`, `type = 'blog'`).
// Project Rules §6.4 / §3.4 — the same schema is used by
// `src/routes/admin/blog/+page.svelte` (client) and
// `src/routes/api/blog/**` (server), so validation can never drift.
import { z } from 'zod';
import { markdownField, metaField, slugField, tagsField } from './content.js';

export const BLOG_STATUSES = ['published', 'draft', 'archived'] as const;
export type BlogStatus = (typeof BLOG_STATUSES)[number];
export const blogStatusSchema = z.enum(BLOG_STATUSES);

/** `pages.category` is fixed for blog rows so the glossary/landing rows stay separate. */
export const BLOG_CATEGORY = 'blog';

/** Every column the admin may write. `views` and the timestamps stay server-managed. */
export const blogPostCreateSchema = z.object({
	slug: slugField,
	title: z
		.string()
		.trim()
		.min(3, 'Title is required.')
		.max(200, 'Title must be 200 characters or fewer.'),
	excerpt: metaField(500, 'Excerpt'),
	body: markdownField(40, 'Body'),
	author: metaField(120, 'Author'),
	featuredImage: z
		.string()
		.trim()
		.max(500, 'Image URL must be 500 characters or fewer.')
		.refine(
			(value) => !value || /^(https?:)?\/\//.test(value) || value.startsWith('/'),
			'Featured image must be an absolute URL or a site path.'
		)
		.optional(),
	tags: tagsField(20),
	status: blogStatusSchema.optional(),
	publishedAt: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, 'Publish date must be YYYY-MM-DD.')
		.optional(),
	metaTitle: metaField(60, 'Meta title'),
	metaDescription: metaField(160, 'Meta description'),
	keywords: metaField(300, 'Keywords')
});

export type BlogPostCreate = z.infer<typeof blogPostCreateSchema>;

/** PATCH-style update: `slug` is the immutable identifier (URL key), everything else optional. */
export const blogPostUpdateSchema = blogPostCreateSchema
	.omit({ slug: true })
	.partial()
	.refine((patch) => Object.keys(patch).length > 0, {
		message: 'Provide at least one field to update.'
	});

export type BlogPostUpdate = z.infer<typeof blogPostUpdateSchema>;

/** Admin (`status=all`) list row — wider than the public projection, never cached. */
export interface BlogAdminRow {
	slug: string;
	title: string;
	body: string | null;
	excerpt: string | null;
	author: string | null;
	featuredImage: string | null;
	tags: string | null;
	status: string | null;
	views: number | null;
	metaTitle: string | null;
	metaDescription: string | null;
	keywords: string | null;
	publishedAt: Date | string | null;
	updatedAt: Date | string | null;
}
