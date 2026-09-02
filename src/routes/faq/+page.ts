import type { PageLoad } from './$types';

export const prerender = false;

interface PagesResponse {
	items?: unknown[];
}

export const load: PageLoad = async ({ fetch }) => {
	try {
		const res = await fetch('/api/pages?type=faq&limit=50');
		if (res.ok) {
			const data: PagesResponse = await res.json();
			return {
				seo: {
					title: 'Frequently Asked Questions —HalalNeo',
					description:
						'Find answers to common questions about halal certification, sourcing, compliance, and the HalalNeo platform.',
					ogImage: 'https://halalneo.com/og-faq.png',
					keywords: ['halal FAQ', 'certification questions', 'halal sourcing help', 'compliance FAQ']
				},
				faqs: data.items ?? []
			};
		}
	} catch {}

	return {
		seo: {
			title: 'Frequently Asked Questions —HalalNeo',
			description:
				'Find answers to common questions about halal certification, sourcing, compliance, and the HalalNeo platform.',
			ogImage: 'https://halalneo.com/og-faq.png',
			keywords: ['halal FAQ', 'certification questions', 'halal sourcing help', 'compliance FAQ']
		},
		faqs: []
	};
};
