import type { PageLoad } from './$types';

const BASE_URL = 'https://halalneo.com';

export const prerender = false;

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch('/api/certifying-bodies?limit=100');
	const certifiers = res.ok ? ((await res.json()) as { items?: any[] }).items ?? [] : [];

	const itemList = {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		name: 'Halal Certifying Bodies',
		description:
			'Directory of recognized halal certifying bodies worldwide — JAKIM, BPJPH, MUIS, SFDA, and more.',
		itemListElement: certifiers.slice(0, 100).map((certifier: any, i: number) => ({
			'@type': 'ListItem',
			position: i + 1,
			item: {
				'@type': 'Organization',
				name: certifier.name,
				url: `${BASE_URL}/certifying-bodies/${certifier.id}`,
				description: `Recognized halal certifying body for ${certifier.country}`,
				address: {
					'@type': 'PostalAddress',
					addressCountry: certifier.country
				},
				priceRange: certifier.standard ?? ''
			}
		}))
	};

	return {
		seo: {
			title: 'Halal Certifying Bodies — HalalNeo',
			description:
				'Browse recognized halal certifying bodies worldwide —JAKIM, BPJPH, MUIS, SFDA, and more. Find accredited certifiers for your market.',
			ogImage: 'https://halalneo.com/api/media/og-certifiers.png',
			keywords: ['halal certifying bodies', 'JAKIM', 'BPJPH', 'accredited certifiers', 'halal accreditation']
		},
		certifiers,
		itemList
	};
};
