import type { ServiceProvider } from './types';

export const serviceProviders: ServiceProvider[] = [
	{
		slug: 'halal-trust-certification',
		name: 'Halal Trust Certification',
		type: 'certification',
		country: 'Malaysia',
		description:
			'Accredited halal certification body recognised by JAKIM, MUIS and BPJPH. Provides end-to-end certification audits for food, cosmetics, pharmaceuticals and medical devices across ASEAN and the Gulf.',
		website: 'https://halaltrust.example',
		email: 'info@halaltrust.example',
		phone: '+60-3-8000-1234',
		whatsapp: '+60-12-345-6789',
		rating: 4.8,
		status: 'active'
	},
	{
		slug: 'safefood-audit',
		name: 'SafeFood Audit Group',
		type: 'certification',
		country: 'Indonesia',
		description:
			'Independent auditing firm specialising in BPJPH halal assurance system implementation. Supports manufacturers through documentation, on-site assessment and surveillance audits.',
		email: 'contact@safefoodaudit.example',
		phone: '+62-21-555-0199',
		whatsapp: '+62-812-555-0199',
		rating: 4.5,
		status: 'active'
	},
	{
		slug: 'gulf-halal-standards',
		name: 'Gulf Halal Standards Bureau',
		type: 'certification',
		country: 'United Arab Emirates',
		description:
			'MoIAT-recognised halal certification authority for GCC markets. Issues GSO 2055-compliant certificates accepted by SFDA, ESMA and regional customs authorities.',
		website: 'https://gulfhalal.example',
		email: 'cert@gulfhalal.example',
		phone: '+971-4-333-8800',
		rating: 4.7,
		status: 'active'
	},
	{
		slug: 'mycargo-shipper',
		name: 'MyCargo Halal Shipper',
		type: 'logistics',
		country: 'Singapore',
		description:
			'Specialised cold-chain logistics provider for halal food and pharma. Maintains temperature-controlled warehousing with halal segregation protocols and IATA GDP certification.',
		website: 'https://mycargo.example',
		email: 'ops@mycargo.example',
		phone: '+65-6555-0123',
		whatsapp: '+65-8555-0123',
		rating: 4.6,
		status: 'active'
	},
	{
		slug: 'emirates-halal-freight',
		name: 'Emirates Halal Freight',
		type: 'logistics',
		country: 'United Arab Emirates',
		description:
			'End-to-end freight forwarding for halal-certified goods across the MENA region. Customs clearance, halal cargo documentation and bonded warehouse services.',
		website: 'https://emiratesfreight.example',
		email: 'freight@emiratesfreight.example',
		phone: '+971-4-222-4400',
		rating: 4.3,
		status: 'active'
	},
	{
		slug: 'asia-halal-logistics',
		name: 'Asia Halal Logistics',
		type: 'logistics',
		country: 'Malaysia',
		description:
			'Integrated 3PL provider with halal-certified warehouses in Port Klang, Penang and Jakarta. Fumigation-free storage, fleet management and last-mile delivery.',
		email: 'info@asiahalogistics.example',
		phone: '+60-3-7777-5600',
		whatsapp: '+60-11-222-5600',
		rating: 4.4,
		status: 'active'
	},
	{
		slug: 'islamic-trade-finance',
		name: 'Islamic Trade Finance Corp',
		type: 'finance',
		country: 'Malaysia',
		description:
			'Shariah-compliant trade financing for halal importers and exporters. Murabaha, Wakala and Istisna structures for inventory and receivables financing.',
		website: 'https://islamicfinance.example',
		email: 'deals@islamicfinance.example',
		phone: '+60-3-2222-7700',
		whatsapp: '+60-12-777-7700',
		rating: 4.9,
		status: 'active'
	},
	{
		slug: 'gulf-halal-capital',
		name: 'Gulf Halal Capital',
		type: 'finance',
		country: 'United Arab Emirates',
		description:
			'Asset-based financing and working capital facilities for halal food and consumer goods traders. Partners with major Islamic banks across the GCC.',
		website: 'https://gulfcapital.example',
		email: 'finance@gulfcapital.example',
		phone: '+971-4-444-9900',
		rating: 4.6,
		status: 'active'
	},
	{
		slug: 'payhalal',
		name: 'PayHalal',
		type: 'payment',
		country: 'Malaysia',
		description:
			'Shariah-compliant payment gateway supporting QR, card and bank transfer. Built for halal merchants with AAOIFI-standard transaction screening and settlement.',
		website: 'https://payhalal.example',
		email: 'support@payhalal.example',
		phone: '+60-3-8888-1200',
		whatsapp: '+60-11-999-1200',
		rating: 4.7,
		status: 'active'
	},
	{
		slug: 'halalpay-global',
		name: 'HalalPay Global',
		type: 'payment',
		country: 'Indonesia',
		description:
			'Cross-border payment processing for halal e-commerce. Multi-currency settlement, Shariah compliance screening and real-time FX for ASEAN, MENA and African corridors.',
		email: 'hello@halalpay.example',
		phone: '+62-21-3333-6700',
		rating: 4.4,
		status: 'active'
	},
	{
		slug: 'takaful-trade-shield',
		name: 'Takaful Trade Shield',
		type: 'insurance',
		country: 'Malaysia',
		description:
			'Takaful (Islamic cooperative) insurance for halal supply chains. Marine cargo, stock-throughput and product liability coverage with Shariah board oversight.',
		website: 'https://takafulshield.example',
		email: 'cover@takafulshield.example',
		phone: '+60-3-9999-2300',
		whatsapp: '+60-12-888-2300',
		rating: 4.8,
		status: 'active'
	},
	{
		slug: 'amanah-halal-insurance',
		name: 'Amanah Halal Insurance',
		type: 'insurance',
		country: 'United Arab Emirates',
		description:
			'Mutual Takaful provider for halal manufacturers and distributors. Covers product recall, trade disruption and transit risks across the Gulf region.',
		website: 'https://amanahins.example',
		email: 'info@amanahins.example',
		phone: '+971-4-555-7700',
		rating: 4.5,
		status: 'active'
	},
	{
		slug: 'halal-trade-advisory',
		name: 'Halal Trade Advisory',
		type: 'consulting',
		country: 'Turkey',
		description:
			'GIMDES and HFG-certified consulting for Turkish and Central Asian halal exporters. Market entry strategy, regulatory compliance and buyer matchmaking.',
		website: 'https://halaladvisory.example',
		email: 'consult@halaladvisory.example',
		phone: '+90-212-555-3400',
		rating: 4.3,
		status: 'active'
	},
	{
		slug: 'neo-halal-consulting',
		name: 'NeoHalal Consulting',
		type: 'consulting',
		country: 'Singapore',
		description:
			'End-to-end halal compliance consulting for food, cosmetics and pharma. Certification gap analysis, supply chain mapping and training programmes for exporters entering ASEAN.',
		website: 'https://neohalal.example',
		email: 'team@neohalal.example',
		phone: '+65-6444-5500',
		whatsapp: '+65-8444-5500',
		rating: 4.7,
		status: 'active'
	}
];
