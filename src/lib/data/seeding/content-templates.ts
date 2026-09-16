import { faker } from '@faker-js/faker';

// ==================== Success Story Template ====================
export const successStoryTemplate = {
	// Basic info
	title: () => faker.company.catchPhrase() + ' Success Story',
	excerpt: () => faker.company.buzzPhrase({ count: 15 }) + '...',
	body: () => `
## ${faker.company.catchPhrase()}

### Challenge
The client faced significant challenges in entering the Target market without proper certification coordination. 

### Solution
We connected them with ${faker.company.name()} for tailored halal certification, logistics planning, and market entry strategy.

### Results
"Working with this platform was transformative. We gained access to a market worth \$${faker.datatype.number({ min: 50, max: 200 })}B+ and established relationships with key suppliers" - ${faker.person.customerName()}

### Key Metrics
${faker.helpers.arrayElements([
	{ label: 'Time to certification', value: `${faker.datatype.number({ min: 1, max: 12 })} months` },
	{ label: 'Market entry', value: `${faker.helpers.arrayElement(['Q1', 'Q2', 'Q3', 'Q4'])} ${faker.datatype.number({ min: 2023, max: 2025 })}` },
	{ label: 'Contract value', value: `\$${faker.datatype.number({ min: 50000, max: 5000000 })}` }
]).map(m => `- **${m.label}**: ${m.value}`).join('\n')}
`.trim(),

	// Supplier info
	supplierSlug: () => faker.helpers.slugify(faker.company.name()),
	supplierName: () => faker.company.name(),
	supplierLogo: () => `https://placehold.co/200x200/3b82f6/white?text=${faker.company.buzzAdjective()[0]}`,

	// Buyer info
	buyerCountry: () => faker.location.country(),
	buyerIndustry: () => faker.helpers.arrayElement(['Food & Beverage', 'Personal Care', 'Pharmaceuticals', 'Cosmetics', 'Packaged Goods']),
	buyerName: () => faker.person.fullName(),
	buyerCompany: () => faker.company.name(),
	
	// Deal details
	dealValue: () => `$${faker.datatype.number({ min: 50000, max: 5000000 }).toLocaleString()}`,
	image: () => faker.internet.url({ domain: 'unsplash' }),
	companyLogo: () => `https://placehold.co/200x200/10b981/white?text=${faker.company.buzzAdjective()[0]}`,
	testimonial: () => `
"${faker.company.catchPhrase()} was instrumental in our success. Their expert guidance on certification requirements and supplier matching helped us enter ${faker.location.country()} with confidence. The ${faker.helpers.arrayElement(['JAKIM', 'BPJPH', 'SFDA'])} certification process was smoother than expected."
`,

	// Timeline
	timeline: () => [
		{
			phase: 1,
			title: 'Initial Consultation',
			duration: '2 weeks',
			description: 'Initial needs assessment and certification pathway planning'
		},
		{
			phase: 2,
			title: 'Documentation Preparation',
			duration: `${faker.datatype.number({ min: 3, max: 8 })} weeks`,
			description: 'Gathering required certificates and compliance documentation'
		},
		{
			phase: 3,
			title: 'Audit & Inspection',
			duration: '2-4 weeks',
			description: 'On-site audit by recognized certification body'
		},
		{
			phase: 4,
			title: 'Certification Obtained',
			duration: '1 week',
			description: 'Certificate issued and supplier - buyer connection complete'
		}
	],

	// Indirect benefits
	indirectBenefits: () => faker.helpers.arrayElements([
		'Enhanced brand reputation in target market',
		'Improved supply chain transparency',
		'Access to new distribution channels',
		'Competitive advantage over non-certified rivals',
		'Eligibility for government incentive programs',
		'Strengthened buyer - supplier trust',
		'Long-term partnership development'
	]),

	// Metadata
	metrics: () => [
		{ label: 'Time to Certification', value: `${faker.datatype.number({ min: 2, max: 12 })} months`, icon: 'calendar' },
		{ label: 'Market Entry', value: `${faker.helpers.arrayElement(['Q1', 'Q2', 'Q3', 'Q4'])} ${faker.datatype.number({ min: 2023, max: 2025 })}`, icon: 'trend-up' },
		{ label: 'Contract Value', value: `\$${faker.datatype.number({ min: 50000, max: 5000000 })}`, icon: 'dollar-sign' }
	],

	// SEO
	metaTitle: () => `${faker.company.catchPhrase()} | Success Story`,
	metaDescription: () => faker.company.buzzPhrase() + ' Success Story in ' + faker.location.country(),
	keywords: () => ['success', 'story', 'halal', faker.location.country(), faker.helpers.arrayElement(['halal-certification', 'market-entry', 'supplier'])].join(','),

	// Status
	status: () => faker.helpers.arrayElement(['draft', 'published']) as 'draft' | 'published',
	featured: () => faker.datatype.boolean(),
	views: () => faker.datatype.number({ min: 0, max: 5000 }),

	// Timestamps
	createdAt: () => faker.date.past({ years: 2 }),
	updatedAt: () => faker.date.recent(),
	updatedAtTimestamp: () => faker.datatype.number({ min: Date.now() - 30 * 24 * 60 * 60 * 1000, max: Date.now() })
};

// ==================== Promotion Template ====================
export const promotionTemplate = {
	// Core info
	title: () => faker.commerce.productName() + ' - ' + faker.helpers.arrayElement(['Flash Sale', 'Seasonal Deal', 'Market Clearance', 'Bulk Discount']),
	description: () => `
**${faker.commerce.productName()}** special promotion for qualified buyers!

**Availability:** ${faker.helpers.arrayElement(['Limited quantity available', 'In stock', 'Pre-order ready']}, **Delivery:** ${faker.helpers.arrayElement(['2-4 weeks', '马上发货', 'Pre-order available'])}

**Qualify by:** ${faker.helpers.arrayElement(['Minimum order value', 'Verified buyer status', 'Certified halal manufacturer'])}
`.trim(),

	// Supplier info
	supplierSlug: () => faker.helpers.slugify(faker.company.name()),
	supplierName: () => faker.company.name(),

	// Product info (optional)
	productSlug: () => faker.helpers.slugify(faker.commerce.productName()),
	productName: () => faker.commerce.productName(),

	// Price & discount
	discountPct: () => faker.datatype.number({ min: 5, max: 40 }),
	priceMin: () => `$${faker.commerce.price({ min: 10, max: 1000 })}/${faker.helpers.arrayElement(['kg', 'box', 'piece', 'case', 'pallet'])}`,
	priceMax: () => `$${faker.commerce.price({ min: 500, max: 20000 })}/${faker.helpers.arrayElement(['kg', 'box', 'piece', 'case', 'pallet'])}`,
	priceUnit: () => faker.helpers.arrayElement(['kg', 'box', 'piece', 'case', 'pallet']),
	moq: () => `${faker.datatype.number({ min: 10, max: 1000 })} ${faker.helpers.arrayElement(['kg', 'boxes', 'units', 'cases'])}`,

	// Timing
	validUntil: () => faker.date.future({ years: 1 }).toISOString(),
	expirationDate: () => faker.date.soon({ days: 30 }).toISOString(),
	status: () => faker.helpers.arrayElement(['active', 'expired', 'archived']) as 'active' | 'expired' | 'archived',

	// Promotion type
	promotionType: () => faker.helpers.arrayElement(['flash-sale', 'seasonal', 'clearance', 'bulk-discount']) as 'flash-sale' | 'seasonal' | 'clearance' | 'bulk-discount',

	// Terms & conditions
	terms: () => [
		'Valid for registered buyers only',
		'Discount applies to first order only',
		'Subject to verification and compliance',
		`Offer expires ${faker.date.soon({ days: 30 }).toLocaleDateString()}`,
		'Limited quantities available'
	].join(' | '),

	// Conditions
	features: () => faker.helpers.arrayElements([
		'Certified halal manufacturer',
		'ISO 22000 certified facility',
		'Free shipping for qualified orders',
		'Flexible payment terms available',
		'Dedicated account manager',
		'Tech-driven quality tracking'
	]),

	// Metadata
	metaTitle: () => faker.commerce.productName() + ' - ' + faker.helpers.arrayElement(['Promotion', 'Deal', 'Special Offer']),
	metaDescription: () => faker.company.buzzPhrase() + ' promotion for ' + faker.commerce.productName(),
	keywords: () => ['promotion', 'halal', 'special-offer', 'discount', faker.commerce.productName()].join(','),

	// counts
	views: () => faker.datatype.number({ min: 0, max: 1000 })
};

// ==================== Data Generators ====================

export function generateSuccessStories(count: number = 5) {
	return Array.from({ length: count }, (_, i) => ({
		...successStoryTemplate,
		id: faker.datatype.hexadecimal({ length: 12 }),
		slug: faker.helpers.slugify(faker.company.catchPhrase()) + '-' + faker.datatype.hexadecimal({ length: 4 })
	}));
}

export function generatePromotions(count: number = 5) {
	return Array.from({ length: count }, (_, i) => ({
		...promotionTemplate,
		id: faker.datatype.hexadecimal({ length: 12 }),
		supplierSlug: faker.helpers.slugify(faker.company.name()),
		productSlug: faker.helpers.slugify(faker.commerce.productName())
	}));
}

// ==================== Quality Standards ====================
export const QUALITY_RULES = {
	// Required field validation
	enforceRequiredFields: true,
	minFieldLength: 2,
	maxCharacterLength: {
		text: 500,
		title: 100,
		body: 5000,
		metaDescription: 160,
		url: 2000
	},

	// Format validation
	validEmailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
	validUrlPattern: /^https?:\/\//,

	// Business constraints
	positiveNumbers: true,
	dateRangeCheck: true,

	// Consistency checks
	resourceCompleteness: 'high',
	contentConsistency: true,

	// Error tolerance
	maxErrorRate: 0.05, // 5%

	// Enhancement
	autoEnrichment: true,
	seoOptimization: true
};

export function validateContentData<T>(dataArray: any[], schema: any): ValidatedData<T>[] {
	return dataArray.map(item => {
		const result = schema.safeParse(item);
		const isValid = result.success;
		const deletedIssues = !isValid ? result.error.issues.map(issue => ({
			field: issue.path.join('.'),
			message: issue.message,
			code: `CONTENT_VALIDATION_ERROR_${issue.path.join('_').toUpperCase()}`,
			timestamp: Date.now()
		})) : null;

		return {
			data: isValid ? result.data : null,
			errors: deletedIssues,
			validated: isValid
		};
	});
}
