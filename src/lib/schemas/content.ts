// Shared Zod primitives for editorial content (knowledge base, blog, glossary).
// Project Rules §6.1 / §6.4: one validator per column type, reused by the
// admin pages (client) and the /api content routes (server) so the two can
// never drift.
import { z } from 'zod';

/** URL slug: lowercase letters, digits and single dashes (no leading/trailing dash). */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Slug column shared by every content type (slug is the D1 primary key). */
export const slugField = z
	.string()
	.trim()
	.min(3, 'Slug must be at least 3 characters.')
	.max(200, 'Slug must be 200 characters or fewer.')
	.regex(SLUG_PATTERN, 'Slug may only contain lowercase letters, numbers and dashes.');

const HTML_TAG_RE =
	/<\s*(?:h[1-6]|p|ul|ol|li|div|span|table|tr|td|th|img|a|br|hr|strong|em|b|i|blockquote|pre|code)\b/i;
const MARKDOWN_HINT_RE =
	/(^|\n)\s*(#{1,6}\s|[-*+]\s|\d+\.\s|>\s)|\*\*[^*\n]+\*\*|\[[^\]\n]+\]\([^)\n]+\)|```/;

/**
 * Light "this is raw HTML, not Markdown" detector. Project rule: KB/blog bodies
 * are stored as Markdown and rendered with `marked` — bare HTML must not be
 * written. HTML that is mixed with real Markdown syntax (legacy rows being
 * converted in place) is allowed so editors are not blocked mid-migration.
 */
export function looksLikeHtml(value: string): boolean {
	return HTML_TAG_RE.test(value) && !MARKDOWN_HINT_RE.test(value);
}

/** Long-form body column, validated as Markdown. */
export function markdownField(minChars: number, label = 'Body') {
	return z
		.string()
		.trim()
		.min(minChars, `${label} must be at least ${minChars} characters.`)
		.max(120_000, `${label} is too long (max 120,000 characters).`)
		.refine(
			(value) => !looksLikeHtml(value),
			`${label} must be Markdown. This article still stores raw HTML — convert the markup to Markdown before saving.`
		);
}

/** Short plain-text column (summaries, glossary definitions) — HTML is never acceptable. */
export function plainTextField(minChars: number, maxChars: number, label: string) {
	return z
		.string()
		.trim()
		.min(minChars, `${label} is required.`)
		.max(maxChars, `${label} must be ${maxChars} characters or fewer.`)
		.refine((value) => !looksLikeHtml(value), `${label} must be plain text, not HTML.`);
}

/** Optional SEO/meta text column. */
export function metaField(maxChars: number, label: string) {
	return z
		.string()
		.trim()
		.max(maxChars, `${label} must be ${maxChars} characters or fewer.`)
		.optional();
}

/** Tag list column — the admin forms send a real array, the DB stores JSON text. */
export function tagsField(max = 20) {
	return z
		.array(z.string().max(60, 'Each tag must be 60 characters or fewer.'))
		.max(max, `At most ${max} tags.`)
		.optional();
}

/** Parse the JSON-array `tags` column defensively (hand-seeded rows may hold junk). */
export function parseTagList(raw: string | string[] | null | undefined): string[] {
	if (Array.isArray(raw)) return raw.filter((t): t is string => typeof t === 'string');
	if (typeof raw !== 'string' || !raw.trim()) return [];
	try {
		const parsed: unknown = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed.filter((t): t is string => typeof t === 'string') : [];
	} catch {
		return splitTags(raw);
	}
}

/** Split a comma-separated input into a deduped tag list (shared by the admin forms). */
export function splitTags(raw: string): string[] {
	const seen = new Set<string>();
	for (const part of raw.split(',')) {
		const tag = part.trim();
		if (tag) seen.add(tag);
	}
	return [...seen];
}

/** Lowercase URL slug from free text (admin forms auto-derive a slug from the title). */
export function slugify(value: string): string {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}
