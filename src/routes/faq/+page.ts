import type { PageLoad } from './$types';

// The FAQ list is the curated static array in +page.svelte (it also feeds the
// FAQPage JSON-LD); /api/pages has no 'faq' type, so fetching it here was a
// dead sub-request on every SSR render.
export const prerender = false;

export const load: PageLoad = () => ({
	seo: {
		title: 'Frequently Asked Questions — HalalNeo',
		description:
			'Find answers to common questions about halal certification, sourcing, compliance, and the HalalNeo platform.',
		ogImage: 'https://halalneo.com/brand/og-default.png',
		keywords: ['halal FAQ', 'certification questions', 'halal sourcing help', 'compliance FAQ']
	}
});
