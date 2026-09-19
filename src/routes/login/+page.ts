import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = () => ({
	seo: {
		title: 'Sign In — HalalNeo',
		description: 'Sign in to your HalalNeo account.',
		robots: 'noindex, nofollow'
	}
});
