import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ url }) => {
	return {
		seo: {
			title: 'HalalNeo — Halal Trade Intelligence',
			description:
				'Halal trade intelligence for buyers and suppliers — certification, sourcing and market guides in one place.',
			ogImage: 'https://halalneo.com/og-default.svg',
			twitterSite: '@halalneo'
		}
	};
};
