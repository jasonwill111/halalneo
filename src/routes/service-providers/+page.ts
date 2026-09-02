import type { PageLoad } from './$types';

export const prerender = false;

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch('/api/service-providers?limit=100');
	const providers = res.ok ? (await res.json()).items ?? [] : [];

	return {
		seo: {
			title: 'Halal Service Providers —HalalNeo',
			description:
				'Find halal-certified service providers —certification consultants, logistics partners, finance, and compliance experts.',
			ogImage: 'https://halalneo.com/og-services.png',
			keywords: ['halal service providers', 'certification consultants', 'halal logistics', 'compliance experts']
		},
		providers
	};
};
