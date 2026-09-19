import type { PageLoad } from './$types';

export const prerender = false;

export const load: PageLoad = () => ({
	seo: {
		title: 'Manage Blog — HalalNeo Admin',
		description: 'Manage blog posts and articles on HalalNeo.'
	}
});
