import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	return {
		seo: {
			title: 'RFQ Builder — HalalNeo',
			description:
				'Build a halal-ready request for quotation: product specs, certification requirements, documents and delivery terms. Copy or download free.',
			ogImage: 'https://halalneo.com/api/media/og-default.png'
		}
	};
};
