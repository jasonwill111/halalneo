import type { PageLoad } from './$types';

const BASE_URL = 'https://halalneo.com';

export const prerender = false;

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch('/api/market-guides?limit=50');
	const data: { items?: any[]; total?: number } = res.ok ? ((await res.json()) as any) : { items: [], total: 0 };

	const guides = (data.items ?? []) as any[];

	const itemList = {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		name: 'Halal Market Guides',
		description:
			'Country-by-country halal certification requirements, costs, and market entry guides for major halal markets.',
		itemListElement: guides.slice(0, 50).map((guide: any, i: number) => ({
			'@type': 'ListItem',
			position: i + 1,
			item: {
				'@type': 'WebPage',
				name: `HalalMarket Guide: ${guide.country}`,
				description: `Halal certification requirements and market entry guide for ${guide.country}`,
				url: `${BASE_URL}/market-guides/${guide.slug}`
			}
		}))
	};

	return {
		guides,
		seo: {
			title: 'Halal Market Guides — Country-by-Country Certifiers, Requirements & Costs',
			description:
				'Comprehensive halal market guides for the world\'s major halal markets — certification bodies, import requirements, costs, and opportunities.',
			ogImage: 'https://halalneo.com/api/media/og-default.png',
			keywords: ['halal market guide', 'halal certification by country', 'halal import requirements']
		},
		itemList
	};
};
