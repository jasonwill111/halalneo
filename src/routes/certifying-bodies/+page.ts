import type { PageLoad } from './$types';
import { fetchSafe, firstFailure, type LoadFailure } from '#lib/utils/load-error.js';
import { readItems } from '#lib/utils/api-response.js';
import type { CertifyingBodyRecord } from '#lib/schemas/certifying-bodies.js';

const BASE_URL = 'https://halalneo.com';

export const prerender = false;

export const load: PageLoad = async ({ fetch }) => {
	const failures: LoadFailure[] = [];
	const res = await fetchSafe(fetch, '/api/certifying-bodies?limit=100', failures);
	const certifiers = await readItems<CertifyingBodyRecord>(res);

	const itemList = {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		name: 'Halal Certifying Bodies',
		description:
			'Directory of recognized halal certifying bodies worldwide — JAKIM, BPJPH, MUIS, SFDA, and more.',
		itemListElement: certifiers.slice(0, 100).map((certifier, i) => ({
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
		itemList,
		loadError: firstFailure(failures)
	};
};
