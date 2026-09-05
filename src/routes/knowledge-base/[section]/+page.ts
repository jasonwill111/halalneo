import type { PageLoad } from './$types';

export const prerender = false;

interface KbSectionResponse {
	articles?: unknown[];
}

export const load: PageLoad = async ({ params, fetch }) => {
	const sectionTitle = params.section.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

	try {
		const res = await fetch(`/api/knowledge-base?section=${params.section}&limit=50`);
		if (res.ok) {
			const data: KbSectionResponse = await res.json();
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
