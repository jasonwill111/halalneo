import type { PageLoad } from './$types';
import { fetchSafe, firstFailure, type LoadFailure } from '#lib/utils/load-error.js';
import { readItems } from '#lib/utils/api-response.js';
import type { ServiceProviderRecord } from '#lib/schemas/service-providers.js';

const BASE_URL = 'https://halalneo.com';

export const prerender = false;

export const load: PageLoad = async ({ fetch }) => {
	const failures: LoadFailure[] = [];
	const res = await fetchSafe(fetch, '/api/service-providers?limit=100', failures);
	const providers = await readItems<ServiceProviderRecord>(res);

	const itemList = {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		name: 'Halal Service Providers',
		description:
			'Directory of halal-certified service providers — certification consultants, logistics, finance, and compliance experts.',
		itemListElement: providers.slice(0, 100).map((provider, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			item: {
				'@type': 'Organization',
				name: provider.name,
				url: `${BASE_URL}/service-providers/${provider.slug}`,
				description: provider.description,
				address: {
					'@type': 'PostalAddress',
					addressCountry: provider.country
				}
			}
		}))
	};

	return {
		seo: {
			title: 'Halal Service Providers — HalalNeo',
			description:
				'Find halal-certified service providers —certification consultants, logistics partners, finance, and compliance experts.',
			ogImage: 'https://halalneo.com/api/media/og-services.png',
			keywords: ['halal service providers', 'certification consultants', 'halal logistics', 'compliance experts']
		},
		providers,
		itemList,
		loadError: firstFailure(failures)
	};
};
