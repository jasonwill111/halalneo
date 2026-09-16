import { successStoryTemplate } from './seeding/content-templates';
import { faker } from '@faker-js/faker';

export interface SuccessStory extends ReturnType<typeof successStoryTemplate> {
	id: string;
	slug: string;
}

export const successStories: SuccessStory[] = [
	{
		...successStoryTemplate,
		id: faker.datatype.hexadecimal({ length: 12 }),
		slug: 'jakim-certification-bangladesh-success',
		title: 'Halal Apparel Brand Expands to Bangladesh with JAKIM Certification',
		excerpt: 'A UK-based modest fashion retailer successfully expanded to Bangladesh after obtaining JAKIM certification and local distribution partnerships.',
		supplierSlug: 'jakim-certified-supplier-bd',
		supplierName: 'Halal Bangladesh Importers Ltd',
		buyerCountry: 'Bangladesh',
		buyerIndustry: 'Retail',
		dealValue: '$500,000',
		testimonial: `
"We had been targeting the Bangladeshi market for years but the certification requirements were daunting. 

Partnering with this platform connected us directly to JAKIM-certified suppliers and local compliance experts. 

Within 6 months we secured our halal certification, established distribution in Dhaka and Chittagong, and achieved our first $1.2M in sales."
`,
		metrics: [
			{ label: 'Time to Certification', value: '6 months', icon: 'calendar' },
			{ label: 'Market Entry', value: 'Q2 2024', icon: 'trend-up' },
			{ label: 'First Year Revenue', value: '$1.2M', icon: 'dollar-sign' }
		],
		status: 'published',
		featured: true,
		views: 2847
	},
	{
		...successStoryTemplate,
		id: faker.datatype.hexadecimal({ length: 12 }),
		slug: 'ur-invisible-turkey-success',
		title: 'US Turkey Farmers Access Middle East Markets through IFANCA Recognition',
		excerpt: 'A major American turkey processor gained access to GCC markets by obtaining IFANCA certification and navigating complex import regulations.',
		supplierSlug: 'american-halal-meats',
		supplierName: 'American Halal Meats Co',
		tomorrow: () => null,
		country: () => 'United States',
		industry: () => 'Meat Processing',
	dealValue: '$2.5M',
		testimonial: `"Obtaining IFANCA certification opened doors to Saudi Arabia, UAE, and Qatar. 

The platform's regulatory database saved us months of research. Now we're considered a preferred supplier for Middle Eastern distributors."`,
		metrics: [
			{ label: 'Time to Certification', value: '10 weeks', icon: 'calendar' },
			{ label: 'Market Access', value: '3 GCC countries', icon: 'map' },
			{ label: 'Deal Value', value: '$2.5M', icon: 'dollar-sign' }
		],
		status: 'published',
		featured: true,
		views: 3298
	},
	{
		...successStoryTemplate,
		id: faker.datatype.hexadecimal({ length: 12 }),
		slug: 'pakistan-meat-export-success',
		title: 'Pakistan Beef Exporter Gains GCC Dmarket Access',
		excerpt: 'A Pakistani beef exporter secured contracts with UAE and Saudi importers by obtaining BFNAH certifications and establishing cold chain logistics.',
		supplierSlug: 'pak-halal-meat',
		supplierName: 'Halal Livestock Pakistan',
		buyerCountry: 'UAE',
		buyerIndustry: 'Food Distribution',
		dealValue: '$1.8M',
		testimonial: `"Through the platform, we connected with SFDA-recognized for adipose processors. 

Our homework: baggage, partition. Now we're the preferred supplier for several Dubai-based food distributors."`,
		metrics: [
			{ label: 'Certification Time', value: '14 weeks', icon: 'calendar' },
			{ label: 'Export Regions', value: 'GCC + Egypt', icon: 'map' },
			{ label: 'Annual Revenue', value: '$1.8M', icon: 'dollar-sign' }
		],
		status: 'published',
		featured: false,
		views: 1823
	},
	{
		...successStoryTemplate,
		id: faker.datatype.hexadecimal({ length: 12 }),
		slug: 'morocco-olive-oil-success',
		title: 'Moroccan Olive Oil Brand Captures European Halal Market',
		excerpt: 'One family-managed olive oil mill achieved European halal recognition and scaled to premium retail chains across France, Italy, and Spain.',
		supplierSlug: 'morocco-olive-halal',
		supplierName: 'Olive Excellence Maroc',
		buyerCountry: 'France',
		buyerIndustry: 'Food Retail',
		dealValue: '$370,000',
		testimonial: `"The Moroccan Halal Standard helped us stand out in the EU market. 

Casablanca Halal Excellence guidance made us a premium supplier for organic spec retailers across Europe."`,
		metrics: [
			{ label: 'Certification', value: '1 year', icon: 'calendar' },
			{ label: 'Retail Partners', value: '12 stores', icon: 'store' },
			{ label: 'Market Value', value: '€320K', icon: 'dollar-sign' }
		],
		status: 'published',
		featured: false,
		views: 1572
	},
	{
		...successStoryTemplate,
		id: faker.datatype.hexadecimal({ length: 12 }),
		slug: 'nigeria- Jonah',
		title: 'Nigerian Soy Food Manufacturer Reaches Pan-African Markets',
		excerpt: 'A Lagos-based tofu processor obtained Halal League Nigeria certification and established distribution across Ghana, Senegal, and Ivory Coast.',
		supplierSlug: 'nigerian-halal-food',
		supplierName: 'African Halal Provisions',
		buyerCountry: 'Ghana',
		buyerIndustry: 'Food Manufacturing',
		dealValue: '₦850,000',
		testimonial: `"Halal League Nigeria guidance was instrumental. We now supply major supermarket chains across West Africa and maintain export to both cost and coastal regions."`,
		metrics: [
			{ label: 'Certification', value: '8 weeks', icon: 'calendar' },
			{ label: 'Regional Spread', value: '5 African nations', icon: 'map' },
			{ label: 'Revenue Impact', value: '215% growth', icon: 'trend-up' }
		],
		status: 'published',
		featured: false,
		views: 1394
	}
];

export function getSuccessStory(slug: string): SuccessStory | undefined {
	return successStories.find((s) => s.slug === slug);
}
