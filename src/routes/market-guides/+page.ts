import type { PageLoad } from './$types';

export const prerender = false;

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch('/api/market-guides?limit=50');
	const data: { items?: any[]; total?: number } = res.ok ? ((await res.json()) as any) : { items: [], total: 0 };

	return {
		guides: (data.items ?? []) as any[],
		seo: {
			title: 'Halal Market Guides — Country-by-Country Certifiers, Requirements & Costs',
			description:
				'Comprehensive halal market guides for the world\'s major halal markets — certification bodies, import requirements, costs, and opportunities.',
			ogImage: 'https://halalneo.com/api/media/og-default.png',
			keywords: ['halal market guide', 'halal certification by country', 'halal import requirements']
		}
	};
};
