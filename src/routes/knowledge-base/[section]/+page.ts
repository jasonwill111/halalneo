import type { PageLoad } from './$types';
import { getSection } from '#lib/data/kb-sections.js';

export const prerender = false;

interface KbSectionResponse {
	items?: unknown[];
	articles?: unknown[];
}

export const load: PageLoad = async ({ params, fetch }) => {
	// Real display name from the static section definitions (e.g. slug
	// 'country-market-guides' -> 'Country / Market Guides'); fall back to
	// title-casing the slug for unknown sections.
	const sectionTitle = getSection(params.section)?.title ?? params.section.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

	try {
		const res = await fetch(`/api/knowledge-base?section=${params.section}&limit=50`);
		if (res.ok) {
			const data: KbSectionResponse = (await res.json()) as any;
			const articles = (data.items ?? data.articles ?? []).map((a: any) => ({
				...a,
				tags: typeof a.tags === 'string' ? JSON.parse(a.tags || '[]') : a.tags ?? []
			}));
			return {
				seo: {
					title: `${sectionTitle} — HalalNeo Knowledge Base`,
					description: `Explore ${sectionTitle.toLowerCase()} articles and guides on HalalNeo — halal certification and compliance resources.`,
					ogImage: 'https://halalneo.com/api/media/og-kb.png',
					keywords: [sectionTitle, 'halal knowledge base', 'certification guide', 'compliance']
				},
				item: {
					slug: params.section,
					name: sectionTitle,
					description: `Explore ${sectionTitle.toLowerCase()} articles and guides on halal certification and compliance.`,
					articleCount: articles.length,
					articles
				}
			};
		}
	} catch {}

	return {
		seo: {
			title: `${sectionTitle} — HalalNeo Knowledge Base`,
			description: `Explore ${sectionTitle.toLowerCase()} articles and guides on HalalNeo — halal certification and compliance resources.`,
			ogImage: 'https://halalneo.com/api/media/og-kb.png'
		},
		item: null
	};
};
