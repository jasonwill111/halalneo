import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		seo: {
			title: 'Halal Market Guides — Country-by-Country Compliance & Opportunities',
			description:
				'Practical market guides for halal trade in Indonesia, Malaysia, UAE, Saudi Arabia, Türkiye, Pakistan, USA — certifiers, import requirements, costs, and opportunities.',
			ogImage: 'https://halalneo.com/api/media/og-default.png'
		}
	};
};
