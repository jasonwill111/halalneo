import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	return {
		signedIn: !!locals.session,
		seo: {
			title: 'Halal Ingredient Checker — AI-Powered Analysis',
			description:
				'Paste any ingredient list and get instant AI-powered halal, haram, or mashbooh verdicts. Free halal ingredient analysis tool.',
			ogImage: 'https://halalneo.com/brand/og-default.png'
		}
	};
};
