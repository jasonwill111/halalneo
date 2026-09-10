import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	return {
		seo: {
			title: 'Halal Trade Tools — HalalNeo',
			description:
				'Free halal trade tools: ingredient checker, certification cost estimator, landed cost calculator, RFQ builder and certificate verification.',
			ogImage: 'https://halalneo.com/api/media/og-default.png'
		}
	};
};
