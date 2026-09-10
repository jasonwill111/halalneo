import type { EntryGenerator, PageLoad } from './$types';
import { getSection } from '#lib/data/kb-sections.js';

export const entries: EntryGenerator = () => [];

interface KbArticle {
	title?: string;
	metaTitle?: string;
	metaDescription?: string;
	summary?: string;
	tags?: string[] | string;
	body?: string;
	content?: string;
	createdAt?: string | null;
	updatedAt?: string | null;
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
	const words = text.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
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
			const data: KbArticle = (await res.json()) as any;
			const tagsParsed =
				typeof data.tags === 'string' ? JSON.parse(data.tags || '[]') : (data.tags ?? []);

			// Related rows come from the KB list projection, which only carries
			// slug/title/section/status/excerpt — no body, so no readTime.
			let related: RelatedArticle[] = [];
			try {
				if (relatedRes.ok) {
					const relatedData = (await relatedRes.json()) as any;
					const candidates = (relatedData.items ?? []).filter(
						(a: any) => a.slug !== params.article
					);
					const tagSet = new Set(tagsParsed.map((t: string) => t.toLowerCase()));
					const scoreOf = (a: any) => {
						const aTags = (
							typeof a.tags === 'string' ? JSON.parse(a.tags || '[]') : (a.tags ?? [])
						) as string[];
						return aTags.filter((t: string) => tagSet.has(t.toLowerCase())).length;
					};
					const toRelated = (a: any): RelatedArticle => ({
						slug: a.slug,
						section: a.section ?? '',
						title: a.title ?? '',
						summary: a.summary ?? a.excerpt ?? ''
					});
					related = candidates
						.toSorted((a: any, b: any) => scoreOf(b) - scoreOf(a))
						.filter((a: any) => scoreOf(a) > 0)
						.slice(0, 3)
						.map(toRelated);
					if (related.length === 0) {
						related = candidates.slice(0, 3).map(toRelated);
					}
				}
			} catch {}

			return {
				slug: params.article,
				section,
				sectionName,
				article: params.article,
				readTime: computeReadTime(data.body ?? data.content),
				seo: {
					// DB per-row meta wins when admins filled it; else derive.
					title: data.metaTitle || (data.title ? `${data.title} — HalalNeo` : `${params.article} — HalalNeo`),
					description:
						data.metaDescription ||
						data.summary ||
						`Read about ${data.title || params.article} on HalalNeo — halal certification and compliance guide.`,
					ogImage: 'https://halalneo.com/api/media/og-kb.png',
					keywords: tagsParsed.length
						? tagsParsed
						: ['halal certification', 'compliance guide', 'trade knowledge']
				},
				item: { ...data, tags: tagsParsed },
				related
			};
		}
	} catch {}

	return {
		slug: params.article,
		section,
		sectionName,
		seo: {
			title: `${params.article} — HalalNeo`,
			description: `Read about ${params.article} on HalalNeo — halal certification and compliance guide.`,
			robots: 'noindex, nofollow'
		},
		item: null,
		related: [] as RelatedArticle[]
	};
};
