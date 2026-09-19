import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = () => ({
	seo: {
		title: 'Create Account — HalalNeo',
		description: 'Create a free HalalNeo account to access halal trade intelligence.',
		robots: 'noindex, nofollow'
	}
});
