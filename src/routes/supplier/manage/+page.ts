import type { PageLoad } from './$types';

export const prerender = false;

export const load: PageLoad = () => ({
	seo: {
		title: 'Manage — HalalNeo Supplier',
		description: 'Manage your supplier company profile and team settings.'
	}
});
