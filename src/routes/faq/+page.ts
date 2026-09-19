import type { PageLoad } from './$types';
import { readList } from '#lib/utils/api-response.js';
import type { PageDto } from '#lib/schemas/pages.js';

export const prerender = false;

export const load: PageLoad = async ({ fetch }) => {
	try {
		const res = await fetch('/api/pages?type=faq&limit=50');
		if (res.ok) {
			const data = await readList<PageDto>(res);
			return {
				seo: {
					title: 'Frequently Asked Questions — HalalNeo',
					description:
						'Find answers to common questions about halal certification, sourcing, compliance, and the HalalNeo platform.',
					ogImage: 'https://halalneo.com/api/media/og-faq.png',
					keywords: ['halal FAQ', 'certification questions', 'halal sourcing help', 'compliance FAQ']
				},
				faqs: data.items ?? []
			};
		}
	} catch {
		// fetch/parse failed — fall back to the static payload below
	}

	return {
		seo: {
			title: 'Frequently Asked Questions — HalalNeo',
			description:
				'Find answers to common questions about halal certification, sourcing, compliance, and the HalalNeo platform.',
			ogImage: 'https://halalneo.com/api/media/og-faq.png',
			keywords: ['halal FAQ', 'certification questions', 'halal sourcing help', 'compliance FAQ']
		},
		faqs: []
	};
};
