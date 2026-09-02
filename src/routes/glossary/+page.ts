import type { PageLoad } from './$types';

export const prerender = false;

interface PagesResponse {
	items?: unknown[];
}

export const load: PageLoad = async ({ fetch }) => {
	try {
		const res = await fetch('/api/pages?category=glossary&limit=100');
		if (res.ok) {
			const data: PagesResponse = await res.json();
			const terms = (data.items ?? []).map((p: any) => ({ term: p.title, definition: p.body ?? p.excerpt ?? '' }));
			return {
				seo: {
					title: 'Halal Trade Glossary — HalalNeo',
					description:
						'Key terms and definitions in halal trade, certification, compliance, and medical device regulation.',
					ogImage: 'https://halalneo.com/og-default.svg',
					keywords: ['halal glossary', 'certification terms', 'trade definitions', 'compliance vocabulary']
				},
				terms
			};
		}
	} catch {}

	return {
		seo: {
			title: 'Halal Trade Glossary — HalalNeo',
			description:
				'Key terms and definitions in halal trade, certification, compliance, and medical device regulation.',
			ogImage: 'https://halalneo.com/og-default.svg',
			keywords: ['halal glossary', 'certification terms', 'trade definitions', 'compliance vocabulary']
		},
		terms: []
	};
};
