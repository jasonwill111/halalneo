import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = () => {
	return {
		seo: {
			title: 'Contact Us —HalalNeo',
			description:
				'Get in touch with HalalNeo for partnerships, listing inquiries, certification support, or general questions.',
			ogImage: 'https://halalneo.com/api/media/og-contact.svg',
			keywords: ['contact HalalNeo', 'partnership inquiries', 'halal certification support', 'B2B contact']
		}
	};
};
