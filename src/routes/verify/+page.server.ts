import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const q = url.searchParams.get('q') ?? '';
	return {
		q,
		seo: {
			title: q
				? `Verify "${q}" — Halal Certificate Check`
				: 'Halal Certificate Verification — Search by Brand, Product or Certifier',
			description:
				'Search halal certification status across JAKIM, MUI, ESMA, GAC, IFANCA and 50+ certifying bodies. Verify certificates by number, brand or product name.',
			ogImage: 'https://halalneo.com/api/media/og-default.svg'
		}
	};
};
