import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		seo: {
			title: 'Halal Export Documentation Templates',
			description:
				'Download ready-to-use templates for halal suppliers, importers, and certifying bodies. RFQ templates, certificate checklists, product catalogs.',
			ogImage: 'https://halalneo.com/api/media/og-default.png'
		}
	};
};