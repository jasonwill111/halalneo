import type { PageLoad } from './$types';

export const prerender = false;

interface PagesResponse {
	items?: unknown[];
}

export const load: PageLoad = async ({ fetch }) => {
	try {
		const res = await fetch('/api/pages?category=glossary&limit=200');
		if (res.ok) {
			const data: PagesResponse = await res.json();
			const terms = (data.items ?? []).map((p: any) => ({
				term: p.title,
				definition: p.body ?? p.excerpt ?? '',
				tags:
					typeof p.tags === 'string'
						? JSON.parse(p.tags || '[]')
						: Array.isArray(p.tags)
							? p.tags
							: []
			}));
			return {
				seo: {
					title: 'Halal Trade Glossary — HalalNeo',
					description:
						'80+ professional terms covering halal certification, packaging, trade, finance, logistics and regulation — explained for B2B buyers and suppliers.',
					ogImage: 'https://halalneo.com/api/media/og-default.svg',
					keywords: [
						'halal glossary',
						'certification terms',
						'trade definitions',
						'logistics vocabulary',
						'islamic finance terms'
					]
				},
				terms
			};
		}
	} catch {}

	return {
		seo: {
			title: 'Halal Trade Glossary — HalalNeo',
			description:
				'80+ professional terms covering halal certification, packaging, trade, finance, logistics and regulation — explained for B2B buyers and suppliers.',
			ogImage: 'https://halalneo.com/api/media/og-default.svg',
			keywords: ['halal glossary', 'certification terms', 'trade definitions']
		},
		terms: []
	};
};
