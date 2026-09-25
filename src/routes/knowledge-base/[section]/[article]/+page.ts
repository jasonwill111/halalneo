import type { EntryGenerator, PageLoad } from './$types';
import { readJson } from '#lib/utils/api-response.js';
import type { ApiList } from '#lib/types/api.js';
import { getSection } from '#lib/data/kb-sections.js';

export const entries: EntryGenerator = () => [];

/** `/api/knowledge-base/[slug]` row (all columns nullable over the wire). */
interface KbArticle {
	slug?: string | null;
	section?: string | null;
	title?: string | null;
	metaTitle?: string | null;
	metaDescription?: string | null;
	summary?: string | null;
	tags?: string[] | string | null;
	body?: string | null;
	/** Legacy key some early payloads used instead of `body`. */
	content?: string | null;
	author?: string | null;
	status?: string | null;
	views?: number | null;
	createdAt?: string | null;
	updatedAt?: string | null;
}

/** `/api/knowledge-base` list projection — `excerpt` (not `summary`), no body/tags. */
interface KbListRow {
	slug: string;
	title: string | null;
	section: string | null;
	status: string | null;
	excerpt: string | null;
	views: number | null;
	/** Not in the current projection; the matcher below still reads them defensively. */
	summary?: string | null;
	tags?: string | string[] | null;
}

interface RelatedArticle {
	slug: string;
	section: string;
	title: string;
	summary: string;
}

// Body text is stored as Markdown (or legacy raw HTML); a rough words/200
// estimate is enough for the "N min read" badge.
function computeReadTime(text: string | undefined | null): string {
	if (!text) return '1 min read';
	const words = text
		.replace(/<[^>]*>/g, ' ')
		.split(/\s+/)
		.filter(Boolean).length;
	return `${Math.max(1, Math.round(words / 200))} min read`;
}

export const load: PageLoad = async ({ params, fetch }) => {
	const section = params.section;
	const sectionName = getSection(section)?.title ?? null;

	try {
		const [res, relatedRes] = await Promise.all([
			fetch(`/api/knowledge-base/${params.article}`),
			fetch('/api/knowledge-base?limit=100')
		]);

		if (res.ok) {
			const data: KbArticle = await readJson<KbArticle>(res);
			const tagsParsed =
				typeof data.tags === 'string'
					? (JSON.parse(data.tags || '[]') as string[])
					: (data.tags ?? []);

			// Related rows come from the KB list projection, which only carries
			// slug/title/section/status/excerpt — no body, so no readTime.
			let related: RelatedArticle[] = [];
			try {
				if (relatedRes.ok) {
					const relatedData = await readJson<ApiList<KbListRow>>(relatedRes);
					const candidates = (relatedData.items ?? []).filter((a) => a.slug !== params.article);
					const tagSet = new Set(tagsParsed.map((t) => t.toLowerCase()));
					const scoreOf = (a: KbListRow) => {
						const aTags = (
							typeof a.tags === 'string' ? (JSON.parse(a.tags || '[]') as string[]) : (a.tags ?? [])
						) as string[];
						return aTags.filter((t) => tagSet.has(t.toLowerCase())).length;
					};
					const toRelated = (a: KbListRow): RelatedArticle => ({
						slug: a.slug,
						section: a.section ?? '',
						title: a.title ?? '',
						summary: a.summary ?? a.excerpt ?? ''
					});
					related = candidates
						.toSorted((a, b) => scoreOf(b) - scoreOf(a))
						.filter((a) => scoreOf(a) > 0)
						.slice(0, 3)
						.map(toRelated);
					if (related.length === 0) {
						related = candidates.slice(0, 3).map(toRelated);
					}
				}
			} catch {
				// related list is best-effort — the article still renders
			}

			return {
				slug: params.article,
				section,
				sectionName,
				article: params.article,
				readTime: computeReadTime(data.body ?? data.content),
				seo: {
					// DB per-row meta wins when admins filled it; else derive.
					title:
						data.metaTitle ||
						(data.title ? `${data.title} — HalalNeo` : `${params.article} — HalalNeo`),
					description:
						data.metaDescription ||
						data.summary ||
						`Read about ${data.title || params.article} on HalalNeo — halal certification and compliance guide.`,
					ogImage: 'https://halalneo.com/brand/og-default.png',
					keywords: tagsParsed.length
						? tagsParsed
						: ['halal certification', 'compliance guide', 'trade knowledge'],
					ogType: 'article'
				},
				item: { ...data, tags: tagsParsed },
				related
			};
		}
	} catch {
		// fetch/parse failed — fall back to the static payload below
	}

	return {
		slug: params.article,
		section,
		sectionName,
		seo: {
			title: `${params.article} — HalalNeo`,
			description: `Read about ${params.article} on HalalNeo — halal certification and compliance guide.`,
			robots: 'noindex, nofollow',
			ogType: 'article'
		},
		item: null,
		related: [] as RelatedArticle[]
	};
};
