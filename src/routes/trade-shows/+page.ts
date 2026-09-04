import type { PageLoad } from './$types';

export const prerender = false;

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch('/api/trade-shows?limit=50');
	const data = res.ok ? await res.json() : { items: [], total: 0 };

	return {
		shows: data.items ?? [],
		seo: {
			title: 'Global Halal Trade Shows & Exhibitions — Calendar & Events',
			description:
				'Calendar of halal trade shows, exhibitions, and industry events worldwide — MIHAS, Gulfood, Halal Expo Istanbul and more.',
			ogImage: 'https://halalneo.com/api/media/og-default.svg',
			keywords: ['halal trade show', 'halal exhibition', 'MIHAS', 'Gulfood', 'halal expo']
		}
	};
};
