// Shared Zod schema for Knowledge Base articles (D1 table `knowledge_base`).
// Project Rules §6.4 / §3.4 — the same schema is used by
// `src/routes/admin/knowledge/+page.svelte` (client) and
// `src/routes/api/knowledge-base/**` (server), so validation can never drift.
import { z } from 'zod';
import { markdownField, metaField, slugField, tagsField } from './content.js';

/**
 * KB sections — MUST stay in sync with the Drizzle enum in
 * `src/lib/server/db/schema.ts` (`knowledgeBase.section`, lines 137-146).
 * The admin form renders its <Select> from this list, so a section can never
 * be free text that the DB enum rejects.
 */
export const KB_SECTIONS = [
	'halal-certification',
	'trade-sourcing',
	'logistics',
	'packaging-labeling',
	'country-market-guides',
	'due-diligence'
] as const;

export type KbSection = (typeof KB_SECTIONS)[number];

export const KB_STATUSES = ['published', 'draft', 'archived'] as const;
export type KbStatus = (typeof KB_STATUSES)[number];

/** Section / status enums, exported so query-string params get validated too. */
export const kbSectionSchema = z.enum(KB_SECTIONS);
export const kbStatusSchema = z.enum(KB_STATUSES);

/**
 * Human titles per section, mirroring the public knowledge base copy in
 * `src/lib/data/kb-sections.ts`. Kept here (not imported from `src/lib/data`)
 * because the admin form must validate against the DB enum, not the demo data.
 */
export const KB_SECTION_LABELS: Record<KbSection, string> = {
	'halal-certification': 'Halal Certification',
	'trade-sourcing': 'Trade & Sourcing',
	logistics: 'Logistics & Supply Chain',
	'packaging-labeling': 'Packaging & Labeling',
	'country-market-guides': 'Country / Market Guides',
	'due-diligence': 'Buyer Due Diligence'
};

/** Human label for a section slug; unknown values degrade to a capitalised slug. */
export function kbSectionLabel(section: string): string {
	const parsed = kbSectionSchema.safeParse(section);
	if (parsed.success) return KB_SECTION_LABELS[parsed.data];
	return section
		.split('-')
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(' ');
}

/** Every column the admin may write. `views` and the timestamps stay server-managed. */
export const knowledgeArticleCreateSchema = z.object({
	slug: slugField,
	section: kbSectionSchema,
	title: z
		.string()
		.trim()
		.min(3, 'Title is required.')
		.max(200, 'Title must be 200 characters or fewer.'),
	summary: metaField(500, 'Summary'),
	body: markdownField(40, 'Body'),
	tags: tagsField(20),
	author: metaField(120, 'Author'),
	status: kbStatusSchema.optional(),
	metaTitle: metaField(60, 'Meta title'),
	metaDescription: metaField(160, 'Meta description'),
	keywords: metaField(300, 'Keywords')
});

export type KnowledgeArticleCreate = z.infer<typeof knowledgeArticleCreateSchema>;

/** PATCH-style update: `slug` is the immutable identifier (URL key), everything else optional. */
export const knowledgeArticleUpdateSchema = knowledgeArticleCreateSchema
	.omit({ slug: true })
	.partial()
	.refine((patch) => Object.keys(patch).length > 0, {
		message: 'Provide at least one field to update.'
	});

export type KnowledgeArticleUpdate = z.infer<typeof knowledgeArticleUpdateSchema>;

/** Admin (`status=all`) list row — wider than the public projection, never cached. */
export interface KbAdminRow {
	slug: string;
	section: KbSection;
	title: string;
	summary: string | null;
	tags: string | null;
	author: string | null;
	status: string | null;
	views: number | null;
	updatedAt: Date | string | null;
}
