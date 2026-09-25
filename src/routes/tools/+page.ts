import type { PageLoad } from './$types';

const BASE_URL = 'https://halalneo.com';

export const load: PageLoad = async () => {
	const tools = [
		{
			name: 'Ingredient Checker',
			description:
				'Paste any ingredient list and get an AI halal, haram or mashbooh verdict per ingredient.',
			url: '/tools/ingredient-checker'
		},
		{
			name: 'Certification Cost Estimator',
			description:
				'Estimate halal certification cost and timeline by certifier, category and company size.',
			url: '/tools/certification-cost'
		},
		{
			name: 'Landed Cost Calculator',
			description:
				'CIF, duty, VAT, clearance and amortised certification cost — true per-unit cost per shipment.',
			url: '/tools/landed-cost'
		},
		{
			name: 'RFQ Builder',
			description:
				'Assemble a halal-ready request for quotation with cert, label and document requirements.',
			url: '/tools/rfq-builder'
		},
		{
			name: 'Verify Certificate',
			description: 'Check a halal certificate number against supplier and product records.',
			url: '/verify'
		},
		{
			name: 'HalalNeo AI',
			description: 'Plain-language answers grounded in certifier data. In preparation.',
			url: '/tools/ai-chat'
		}
	];

	const itemList = {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		name: 'HalalTrade Tools',
		description:
			'Free halal trade tools: ingredient checker, certification cost estimator, landed cost calculator, RFQ builder and certificate verification.',
		itemListElement: tools.map((tool, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			item: {
				'@type': 'SoftwareApplication',
				name: tool.name,
				description: tool.description,
				url: `${BASE_URL}${tool.url}`,
				applicationCategory: 'BusinessApplication',
				operatingSystem: 'Web'
			}
		}))
	};

	return {
		seo: {
			title: 'Halal Trade Tools — HalalNeo',
			description:
				'Free halal trade tools: ingredient checker, certification cost estimator, landed cost calculator, RFQ builder and certificate verification.',
			ogImage: 'https://halalneo.com/brand/og-default.png'
		},
		itemList
	};
};
