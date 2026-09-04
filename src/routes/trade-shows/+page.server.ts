import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		seo: {
			title: 'Halal Trade Shows & Exhibitions — Global Events Calendar',
			description:
				'Comprehensive calendar of halal trade shows, exhibitions, and industry events worldwide. Find MIHAS, Gulfood, Halal Expo Istanbul, and 20+ major halal events.',
			ogImage: 'https://halalneo.com/api/media/og-default.svg'
		}
	};
};
