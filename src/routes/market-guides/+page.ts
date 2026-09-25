import type { PageLoad } from './$types';
import { fetchSafe, firstFailure, type LoadFailure } from '#lib/utils/load-error.js';
import { readList } from '#lib/utils/api-response.js';
import type { MarketGuideDto } from '#lib/schemas/market-guides.js';

const BASE_URL = 'https://halalneo.com';

export const prerender = false;

export const load: PageLoad = async ({ fetch }) => {
	const failures: LoadFailure[] = [];
	const res = await fetchSafe(fetch, '/api/market-guides?limit=50', failures);
	const data = await readList<MarketGuideDto>(res);

	const guides = data.items ?? [];

	const itemList = {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		name: 'Halal Market Guides',
		description:
			'Country-by-country halal certification requirements, costs, and market entry guides for major halal markets.',
		itemListElement: guides.slice(0, 50).map((guide, i) => ({
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
				"Comprehensive halal market guides for the world's major halal markets — certification bodies, import requirements, costs, and opportunities.",
			ogImage: 'https://halalneo.com/brand/og-default.png',
			keywords: [
				'halal market guide',
				'halal certification by country',
				'halal import requirements'
			]
		},
		itemList,
		loadError: firstFailure(failures)
	};
};
