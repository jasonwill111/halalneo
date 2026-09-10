import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	return {
		seo: {
			title: 'Landed Cost Calculator — HalalNeo',
			description:
				'Calculate true per-unit landed cost for halal imports: CIF, duty, VAT, clearance and amortised halal certification cost.',
			ogImage: 'https://halalneo.com/api/media/og-default.png'
		}
	};
};
