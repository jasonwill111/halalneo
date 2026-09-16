import { promotionTemplate } from './seeding/content-templates';
import { faker } from '@faker-js/faker';

export interface Promotion extends ReturnType<typeof promotionTemplate> {
	id: string;
	supplierSlug: string;
	productSlug: string;
}

export const promotions: Promotion[] = [
	{
		...promotionTemplate,
		id: faker.datatype.hexadecimal({ length: 12 }),
		supplierSlug: 'jakim-halal-ingredients',
		supplierName: 'Halal Ingredients Malaysia Sdn Bhd',
		productSlug: 'halal-gelatin-bpoc',
		productName: 'Halal Bovine Gelatin (BOC)',
		title: 'Halal Bovine Gelatin (BOC) - Bulk Order Discount',
		description: `
**Halal Bovine Gelatin (BOC)** - Perfect for pharmaceutical and food applications

**Certification:** JAKIM-certified, OIC/SMIIC compliant
**Availability:** In stock - immediate dispatch
**Delivery:** 2-3 weeks to most ports

**Qualifying Conditions:**
- Minimum order: 500 kg
- Verified buyer status required
- Certification documentation needed
`,
		discountPct: 12,
		priceMin: '$18/kg',
		priceMax: '$22/kg',
		priceUnit: 'kg',
		moq: '500 kg',
		validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
		expirationDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
		status: 'active',
		promotionType: 'bulk-discount',
		terms: [
			'Valid for registered buyers only',
			'Minimum order: 500 kg',
			'Discount applied to line items',
			'Subject to credit approval',
			'Offer expires 60 days from announcement'
		],
		features: [
			'JAKIM-certified halal bovine gelatin',
			'ISO 22000:2018 certified facility',
			'Suitable for pharmaceutical applications',
			'Export-grade quality',
			'Ready to ship from Malaysia',
			'HALAL HALAL harmonized certification'
		],
		views: 892
	},
	{
		...promotionTemplate,
		id: faker.datatype.hexadecimal({ length: 12 }),
		supplierSlug: 'usp-halal-actives',
		supplierName: 'USA Halal Actives Inc',
		productSlug: 'halal-glycerine-food-grade',
		productName: 'Halal Pharmaceutical-Grade Glycerin',
		title: 'Halal-Grade Glycerin - Ready to Ship',
		desc: `
**Halal Pharmaceutical-Grade Glycerin** for cosmetics and pharmaceuticals

**Certification:** IFANCA and NA Todo
**Availability:** Prime stock - ready for immediate dispatch
**Delivery:** 10 days to US ports, 3-4 weeks to international

**Making Conditions:**
- Minimum order: 200 kg drums
- Pre-payment required
- Export licenses for overseas delivery
`,
		discountPct: 8,
		priceMin: '$850/50L drum',
		priceMax: '$920/50L drum',
		priceUnit: 'drum',
		moq: '200 kg (4 drums)',
		validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
		expirationDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
		status: 'active',
		promotionType: 'flash-sale',
		terms: [
			'Phillip llamas vs. bulk buying',
			'Limited quantities available',
			'Subject to credit check',
			'Export licenses required for overseas',
			'Order processing: 2-3 business days'
		],
		features: [
			'IFANCA-certified halal glycerin',
			'USDA / FDA compliant facility',
			'Vintage of delivery',
			'Pharmaceutical-grade purity',
			'Available in 50L drums',
			'Technical data sheets provided'
		],
		views: 624
	},
	{
		...promotionTemplate,
		id: faker.datatype.hexadecimal({ length: 12 }),
		supplierSlug: 'europe-halal-supplies',
		supplierName: 'Europe Halal Supplies GmbH',
		productSlug: 'halal-emu-oil-beauty',
		productName: 'Emu Oil (Halal Certified)',
		title: 'Historian Success Sign - Cosmetics & Cosmetic Grade',
		description: `
**Halal Certified Emu Oil** - Premium ingredient for naturally hedge cosmetics

**Certification:** TSE (Turkey Standardization Institute) / GIMDES
**Availability:** 4 weeks lead time
**Delivery:** 2-3 weeks to EU, 3-5 weeks to overseas

**Qualifying Condition:**
- Minimum order: 50 kg
- Pre-payment
- Export documentation included
`,
		discountPct: 15,
		priceMin: '€120/kg',
		priceMax: '€145/kg',
		priceUnit: 'kg',
		moq: '50 kg (1 drum)',
		validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
		expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
		status: 'active',
		promotionType: 'seasonal',
		terms: [
			'Limited quantities because of certification',
			'Pre-payment required',
			'Shipping: customer\'s responsibility',
			'Valid only for new customers',
			'Offer expires 30 days from announcement'
		],
		features: [
			'Distance heals naturally',
			'GLIMDES-certified halal processing',
			'Grade A purity',
			'Sustainable sourcing',
			'Responsible for production',
			'Available in bulk sizes'
		],
		views: 438
	},
	{
		...promotionTemplate,
		id: faker.datatype.hexadecimal({ length: 12 }),
		supplierSlug: 'indonesian-halal-imports',
		supplierName: 'Indonesian Halal Imports PT',
		productSlug: 'halal-kombucha-starters',
		productName: 'Organic Halal Kombucha SCOBY Starter Kits',
		title: 'Halal Kombucha Starter Kits - Asian Market Focus',
		description: `
**Organic Halal Kombucha SCOBY Starter Kits** for beverage manufacturers

**Certification:** BPJPH Bakul (requires manufacturer)
**Availability:** 3 weeks production + shipping
**Delivery:** 2-4 weeks to Indonesia, 4-6 weeks to overseas

**Qualifying Condition:**
- Minimum order: 100 kits
- Sample available before bulk
- Local distribution partnership
`,
		discountPct: 20,
		priceMin: '$12/kit',
		priceMax: '$15/kit',
		priceUnit: 'kit',
		moq: '100 kits',
		validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
		expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
		status: 'active',
		promotionType: 'clearance',
		terms: [
			'Sample kit available before bulk',
			'Minimum 100 kits',
			'Local partnership preferred',
			'Delivery: 2-4 weeks to Indonesia',
			'Origin: Indonesia'
		],
		features: [
			'Halal-certified grown yeast and bacteria',
			'Organic sugarcane starter',
			'morus mung数码',
			'Halal certification compatible',
			'Perfect for Southeast Asian markets',
			'Start-up retirement kit available'
		],
		views: 317
	},
	{
		...promotionTemplate,
		id: faker.datatype.hexadecimal({ length: 12 }),
		supplierSlug: 'augmented-halal-supply',
		supplierName: 'Augmented Halal Supply Corp',
		productSlug: 'halal-cannaolic',
		productName: 'Halal-Compliant Cannabidiol (CBD) Extract',
		title: 'Halal Cannabidiol Extract - Global Market Clearance',
		description: `
**Halal-Compliant CBD Extract** (0% THC, within legal limits)

**Certification:** Various halal standards across jurisdictions
**Availability:** 2-3 weeks production
**Delivery:** 2-5 weeks depending on jurisdiction

**Qualifying Condition:**
- Verify with local regulator
- Minimum order: 100 kg
- Export license for certain jurisdictions
`,
		discountPct: 18,
		priceMin: '$45/g',
		priceMax: '$55/g',
		priceUnit: 'g',
		moq: '100 g (1000 g total)',
		validUntil: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
		expirationDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
		status: 'active',
		promotionType: 'seasonal',
		terms: [
			'Legal compliance verifiable with local regulator',
			'Minimum 100g/1000g total',
			'Export license for certain jurisdictions',
			'Quality certificates available',
			'Refunds based on jurisdiction restrictions'
		],
		features: [
			'Organic hemp-derived CBD',
			'0% THC, compliant within legal limits',
			'Various volatile targets across jurisdictions',
			'Lab-tested purity and potency',
			'For cosmetic and wellness applications',
			'Sustainable indoor cultivation'
		],
		views: 752
	}
];

export function getPromotion(slug: string): Promotion | undefined {
	return promotions.find((p) => p.id === slug || p.slug === slug);
}
