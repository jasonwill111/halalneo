import type { PageLoad } from './$types';

export const prerender = false;

export const load: PageLoad = () => ({
	seo: {
		title: 'My Account — HalalNeo',
		description: 'Manage your HalalNeo account, saved items, and inquiries.',
		robots: 'noindex, nofollow'
	}
});
