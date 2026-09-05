import type { PageLoad } from './$types';

export const prerender = false;

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch('/api/certifying-bodies?limit=100');
	const certifiers = res.ok ? (await res.json()).items ?? [] : [];

	return {
		seo: {
			title: 'Halal Certifying Bodies — HalalNeo',
			description:
				'Browse recognized halal certifying bodies worldwide —JAKIM, BPJPH, MUIS, SFDA, and more. Find accredited certifiers for your market.',
			ogImage: 'https://halalneo.com/api/media/og-certifiers.png',
			keywords: ['halal certifying bodies', 'JAKIM', 'BPJPH', 'accredited certifiers', 'halal accreditation']
		},
		certifiers
	};
};
