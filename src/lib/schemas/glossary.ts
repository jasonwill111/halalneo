// Shared Zod schema for glossary terms.
// Glossary entries are `pages` rows, not their own table: `type = 'landing'`,
// `category = 'glossary'`, `slug = 'glossary-<slugified term>'`,
// `title = term`, `body`/`excerpt = definition` (see `scripts/seed.ts:190-212`
// and `src/routes/glossary/+page.ts`). The admin UI keys rows by `slug`.
import { z } from 'zod';
import { plainTextField, slugify } from './content.js';

export const GLOSSARY_CATEGORY = 'glossary';
export const GLOSSARY_SLUG_PREFIX = 'glossary-';

/** Deterministic primary key for a term (matches the seed convention). */
export function glossarySlugFor(term: string): string {
	return `${GLOSSARY_SLUG_PREFIX}${slugify(term)}`;
}

/** Fields the admin edits; the rest of the `pages` columns are derived server-side. */
export const glossaryTermSchema = z.object({
	term: plainTextField(2, 120, 'Term'),
	definition: plainTextField(15, 2000, 'Definition')
});

export type GlossaryTermInput = z.infer<typeof glossaryTermSchema>;

/** PATCH-style update: `slug` is the immutable identifier, `term`/`definition` optional. */
export const glossaryTermUpdateSchema = glossaryTermSchema
	.partial()
	.refine((patch) => Object.keys(patch).length > 0, {
		message: 'Provide at least one field to update.'
	});

export type GlossaryTermUpdate = z.infer<typeof glossaryTermUpdateSchema>;

/** Row shape returned by `/api/glossary` (public projection of the `pages` row). */
export interface GlossaryRow {
	slug: string;
	term: string;
	definition: string | null;
	status: string | null;
}
