import type { Supplier } from './types';

/**
 * Supplier directory.
 * Illustrative example suppliers matching the D1 seed. Real suppliers are added
 * after onboarding and verification; all certification data must be validated
 * against the certifying body before publishing.
 */
export const suppliers: Supplier[] = [
	{
		slug: 'nusantara-foods',
		name: 'Nusantara Foods',
		country: 'Indonesia',
		businessType: 'manufacturer',
		isBrand: true,
		status: 'active',
		logoInitials: 'NF',
		coverImage: '/api/media/sup-nusantara.jpg',
		description:
			'Family-owned manufacturer of halal-certified spice pastes, sauces and ready-to-cook bases from Jakarta. Operates a dedicated halal production line under a BPJPH Halal Assurance System.',
		yearEstablished: 2009,
		mainMarkets: ['Indonesia', 'Malaysia', 'Singapore', 'GCC'],
		certifications: [
			{
				id: 'nf-1',
				bodyId: 'bpjph',
				bodyName: 'BPJPH / MUI',
				scope: 'Spice pastes, sauces, condiments',
				status: 'certified',
				expiry: '2027-06-30',
				number: 'BPJPH-2024-004871'
			},
			{
				id: 'nf-2',
				bodyId: 'jakim',
				bodyName: 'JAKIM',
				scope: 'Ready-to-cook bases (export)',
				status: 'certified',
				expiry: '2026-11-15',
				number: 'MYE-HCB-22134'
			}
		]
	},
	{
		slug: 'santosa-beverages',
		name: 'Santosa Beverages',
		country: 'Indonesia',
		businessType: 'manufacturer',
		isBrand: true,
		status: 'active',
		logoInitials: 'SB',
		coverImage: '/api/media/sup-santosa.jpg',
		description:
			'Bottler of halal fruit drinks and juice concentrates. All production lines certified halal; uses alcohol-free flavouring systems and dedicated tank storage.',
		yearEstablished: 2012,
		mainMarkets: ['Indonesia', 'Philippines', 'Middle East'],
		certifications: [
			{
				id: 'sb-1',
				bodyId: 'bpjph',
				bodyName: 'BPJPH / MUI',
				scope: 'Fruit drinks, juice concentrates',
				status: 'certified',
				expiry: '2027-03-20',
				number: 'BPJPH-2025-008113'
			}
		]
	},
	{
		slug: 'al-barakah-heritage',
		name: 'Al-Barakah Heritage Foods',
		country: 'Malaysia',
		businessType: 'manufacturer',
		isBrand: true,
		status: 'active',
		logoInitials: 'AB',
		coverImage: '/api/media/sup-albarakah.jpg',
		description:
			'Malaysian producer of traditional halal sweets, biscuits and snack mixes. JAKIM-certified across two facilities with export recognition for Singapore and the Gulf.',
		yearEstablished: 2004,
		mainMarkets: ['Malaysia', 'Singapore', 'GCC'],
		certifications: [
			{
				id: 'ab-1',
				bodyId: 'jakim',
				bodyName: 'JAKIM',
				scope: 'Biscuits, snacks, traditional sweets',
				status: 'certified',
				expiry: '2026-12-31',
				number: 'JAKIM-2024-081132'
			},
			{
				id: 'ab-2',
				bodyId: 'muis',
				bodyName: 'MUIS',
				scope: 'Snack mixes (Singapore import)',
				status: 'certified',
				expiry: '2026-08-18',
				number: 'MUIS-FHCB-2025-0912'
			}
		]
	},
	{
		slug: 'medina-halal-meat',
		name: 'Medina Halal Meat Co.',
		country: 'United Arab Emirates',
		businessType: 'manufacturer',
		isBrand: false,
		status: 'active',
		logoInitials: 'MH',
		coverImage: '/api/media/sup-medina.jpg',
		description:
			'UAE-based processor and exporter of halal beef and poultry. Certified under GSO 2055 with SFDA-approved halal slaughter certificates for Gulf and MENA import.',
		yearEstablished: 2011,
		mainMarkets: ['GCC', 'MENA', 'Central Asia'],
		certifications: [
			{
				id: 'mh-1',
				bodyId: 'moiat',
				bodyName: 'MOIAT',
				scope: 'Frozen beef, poultry (GCC)',
				status: 'certified',
				expiry: '2027-01-10',
				number: 'MOIAT-HCB-0193'
			},
			{
				id: 'mh-2',
				bodyId: 'sfda',
				bodyName: 'SFDA',
				scope: 'Halal slaughter certificates, chilled beef',
				status: 'certified',
				expiry: '2026-09-05',
				number: 'SFDA-HSC-2025-4120'
			}
		]
	},
	{
		slug: 'grainpath-trading',
		name: 'GrainPath Trading',
		country: 'Türkiye',
		businessType: 'trader',
		isBrand: false,
		status: 'active',
		logoInitials: 'GP',
		coverImage: '/api/media/sup-grainpath.jpg',
		description:
			'Istanbul-based halal trading house sourcing and consolidating certified grains, pulses and bulk ingredients from GIMDES-certified mills across Türkiye and Central Asia.',
		yearEstablished: 2016,
		mainMarkets: ['Türkiye', 'Central Asia', 'Middle East'],
		certifications: [
			{
				id: 'gp-1',
				bodyId: 'gimdes',
				bodyName: 'GIMDES',
				scope: 'Grains, pulses, bulk ingredients',
				status: 'certified',
				expiry: '2027-04-15',
				number: 'GIMDES-2025-0071'
			}
		]
	},
	{
		slug: 'saffron-distributors',
		name: 'Saffron Distributors',
		country: 'Singapore',
		businessType: 'wholesaler',
		isBrand: false,
		status: 'active',
		logoInitials: 'SD',
		coverImage: '/api/media/sup-saffron.jpg',
		description:
			'Singapore wholesaler distributing halal-certified FMCG and food service products to HORECA and retail across Southeast Asia. Focuses on suppliers with MUIS-recognized certification.',
		yearEstablished: 2014,
		mainMarkets: ['Singapore', 'Malaysia', 'Indonesia'],
		certifications: [
			{
				id: 'sd-1',
				bodyId: 'muis',
				bodyName: 'MUIS',
				scope: 'FMCG, food service products',
				status: 'certified',
				expiry: '2026-12-01',
				number: 'MUIS-WHCB-2025-0388'
			}
		]
	},
	{
		slug: 'pureharvest-snacks',
		name: 'PureHarvest Snacks',
		country: 'South Africa',
		businessType: 'manufacturer',
		isBrand: true,
		status: 'pending',
		logoInitials: 'PH',
		coverImage: '/api/media/sup-pureharvest.jpg',
		description:
			'Cape Town snack manufacturer producing halal chips and baked snacks. SANHA certification in progress — verification pending.',
		yearEstablished: 2018,
		mainMarkets: ['South Africa', 'Sub-Saharan Africa'],
		certifications: [
			{
				id: 'ph-1',
				bodyId: 'sanha',
				bodyName: 'SANHA',
				scope: 'Chips, baked snacks',
				status: 'pending',
				expiry: '',
				number: ''
			}
		]
	},
	{
		slug: 'crescent-dairy',
		name: 'Crescent Dairy Industries',
		country: 'Malaysia',
		businessType: 'manufacturer',
		isBrand: true,
		status: 'active',
		logoInitials: 'CD',
		description:
			'Selangor-based dairy processor producing milk powder, cheese and cultured products on JAKIM-certified lines with animal-rennet-free processes.',
		yearEstablished: 2010,
		mainMarkets: ['Malaysia', 'Singapore', 'Brunei', 'GCC'],
		certifications: [
			{
				id: 'cd-1',
				bodyId: 'jakim',
				bodyName: 'JAKIM',
				scope: 'Milk powder, cheese, cultured dairy',
				status: 'certified',
				expiry: '2027-05-30',
				number: 'JAKIM-2024-102455'
			}
		]
	},
	{
		slug: 'pureglow-cosmetics',
		name: 'PureGlow Cosmetics',
		country: 'Indonesia',
		businessType: 'manufacturer',
		isBrand: true,
		status: 'active',
		logoInitials: 'PG',
		description:
			'Bandung skincare and personal-care manufacturer with BPJPH halal certification across creams, soaps and serums — no porcine derivatives in formulas or packaging.',
		yearEstablished: 2015,
		mainMarkets: ['Indonesia', 'Malaysia', 'Philippines'],
		certifications: [
			{
				id: 'pg-1',
				bodyId: 'bpjph',
				bodyName: 'BPJPH / MUI',
				scope: 'Skincare creams, soaps, serums',
				status: 'certified',
				expiry: '2027-02-14',
				number: 'BPJPH-2025-013207'
			}
		]
	},
	{
		slug: 'punjab-heritage',
		name: 'Punjab Heritage Grains',
		country: 'Pakistan',
		businessType: 'manufacturer',
		isBrand: false,
		status: 'active',
		logoInitials: 'PH',
		description:
			'Lahore-based miller and exporter of extra-long-grain basmati rice and pulses, certified by Pakistan Halal Authority for Gulf and Central Asian markets.',
		yearEstablished: 2007,
		mainMarkets: ['GCC', 'Central Asia', 'East Africa'],
		certifications: [
			{
				id: 'pj-1',
				bodyId: 'pha',
				bodyName: 'PHA',
				scope: 'Basmati rice, pulses',
				status: 'certified',
				expiry: '2026-10-22',
				number: 'PHA-2024-005318'
			}
		]
	},
	{
		slug: 'liberty-halal-foods',
		name: 'Liberty Halal Foods',
		country: 'United States',
		businessType: 'wholesaler',
		isBrand: false,
		status: 'active',
		logoInitials: 'LH',
		description:
			'New Jersey wholesaler distributing IFANCA-certified pantry staples — honey, oils and grains — to North American halal retailers and food service.',
		yearEstablished: 2013,
		mainMarkets: ['United States', 'Canada'],
		certifications: [
			{
				id: 'lh-1',
				bodyId: 'ifanca',
				bodyName: 'IFANCA',
				scope: 'Honey, oils, grains (distribution)',
				status: 'certified',
				expiry: '2027-01-31',
				number: 'IFANCA-2025-071144'
			}
		]
	}
];

export function getSupplier(slug: string): Supplier | undefined {
	return suppliers.find((s) => s.slug === slug);
}
