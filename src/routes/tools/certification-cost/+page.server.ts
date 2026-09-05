import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		seo: {
			title: 'Halal Certification Cost Estimator — Calculate Fees by Certifier',
			description:
				'Estimate halal certification costs across JAKIM, MUI, ESMA, GAC, IFANCA and other major certifiers. Interactive calculator with timeline estimates.',
			ogImage: 'https://halalneo.com/api/media/og-default.png'
		}
	};
};
