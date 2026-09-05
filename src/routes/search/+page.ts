import type { PageLoad } from './$types';

export const prerender = false;

export const load: PageLoad = async ({ fetch }) => {
	const [glossaryRes] = await Promise.all([
		fetch('/api/pages?category=glossary&limit=50')
	]);

	const glossary = (glossaryRes.ok ? ((await glossaryRes.json()) as { items?: any[] }).items ?? [] : []).map((p: any) => ({
		term: p.title,
		definition: p.body ?? p.excerpt ?? ''
	}));

	return {
		seo: {
			title: 'Search — HalalNeo',
			description:
				'Search halal products, suppliers, certification bodies, and knowledge base articles.',
			ogImage: 'https://halalneo.com/api/media/og-search.png',
			keywords: ['halal search', 'find suppliers', 'halal products', 'certification lookup'],
			robots: 'noindex, follow'
		},
		glossary
	};
};
