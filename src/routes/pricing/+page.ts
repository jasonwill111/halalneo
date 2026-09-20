import type { PageLoad } from './$types';

export const prerender = false;

export const load: PageLoad = () => ({
	seo: {
		title: 'Pricing — HalalNeo',
		description:
			'Simple, transparent pricing for HalalNeo. Start free and grow with plans for product listings, AI tools, analytics, and priority support.',
		ogImage: 'https://halalneo.com/brand/og-default.png'
	}
});
