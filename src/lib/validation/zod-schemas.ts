import { z } from 'zod';

// ==================== Shared Constants ====================
export const MAX_DESCRIPTION_LENGTH = 500;
export const MAX_META_DESCRIPTION_LENGTH = 160;
export const MAX_NAME_LENGTH = 200;
export const MAX_KEYWORDS_COUNT = 10;
export const MIN_NAME_LENGTH = 2;
export const MIN_SHORT_DESCRIPTION_LENGTH = 10;
export const MIN_COUNTRY_LENGTH = 2;
export const MAX_URL_LENGTH = 2000;
export const MAX_KEYWORD_STRING_LENGTH = 500;

// ==================== Shared Schemas ====================
export const BaseMetaSchema = z.object({
	metaTitle: z.string().max(60).optional().or(z.literal('')),
	metaDescription: z.string().max(MAX_META_DESCRIPTION_LENGTH).optional().or(z.literal('')),
	keywords: z.string().max(MAX_KEYWORD_STRING_LENGTH).optional().or(z.literal('')),
});

// ==================== Country & Region Validators ====================
export const CountrySchema = z
	.string()
	.min(MIN_COUNTRY_LENGTH, "Country name must be at least 2 characters")
	.transform(s => s.trim());

export const RegionSchema = z
	.string()
	.min(2)
	.max(50)
	.optional()
	.or(z.literal(''));

// ==================== Media Schema ====================
export const ImageSchema = z.object({
	url: z.string().url(),
	alt: z.string().optional().or(z.literal('')),
});

export const ImagesSchema = z.array(ImageSchema).max(10);
export const VideosSchema = z.array(z.string().url().max(MAX_URL_LENGTH)).max(5);

// ==================== Products Schema ====================
export const ProductsSchema = BaseMetaSchema.extend({
	slug: z.string().min(1).max(100),
	supplierSlug: z.string().min(1).max(100),
	categorySlug: z.string().min(1).max(100),
	name: z.string()
		.min(MIN_NAME_LENGTH, "Product name must be at least 2 characters")
		.max(MAX_NAME_LENGTH, "Product name exceeds 200 characters")
		.transform(s => s.trim()),
	
	shortDescription: z.string()
		.min(MIN_SHORT_DESCRIPTION_LENGTH, "Short description must be at least 10 characters")
		.max(MAX_DESCRIPTION_LENGTH, "Short description exceeds 500 characters")
		.optional()
		.transform(s => s || ''),
	
	description: z.string().optional().or(z.literal('')),
	image: z.string().url().max(MAX_URL_LENGTH).optional().or(z.literal('')),
	images: ImagesSchema.optional().default([]),
	videos: VideosSchema.optional().default([]),
	
	// Pricing - Core business rules
	priceMin: z.number()
		.positive("Price must be greater than 0")
		.lt(1e6, "Price cannot exceed $1,000,000"),
	
	priceMax: z.number().optional(),
	priceUnit: z.string().optional(),
	
	// Additional business fields
	moq: z.string().optional(),
	certStatus: z.enum(['certified', 'pending', 'not-certified', 'not-applicable']).default('pending'),
	units: z.string().optional(),
	originCountry: CountrySchema.optional(),
	features: z.array(z.any()).optional().default([]),
	specifications: z.record(z.string()).optional().default({}),
	faqs: z.array(z.object({
		question: z.string().trim(),
		answer: z.string().trim(),
	})).optional().default([]),
	resources: z.array(z.object({
		title: z.string(),
		url: z.string().url(),
	})).optional().default([]),
	status: z.enum(['active', 'draft', 'archived']).default('draft'),
	views: z.number().int().nonnegative().default(0),
});

// ==================== Suppliers Schema ====================
export const SuppliersSchema = BaseMetaSchema.extend({
	slug: z.string().min(1).max(100),
	name: z.string()
		.min(MIN_NAME_LENGTH, "Supplier name must be at least 2 characters")
		.max(MAX_NAME_LENGTH, "Supplier name exceeds 200 characters")
		.transform(s => s.trim()),
	
	country: CountrySchema,
	website: z.string()
		.regex(/^https?:\/\//i, "Website must start with http:// or https://")
		.optional()
		.or(z.literal('')),
	
	email: z.string().email("Valid email is required").optional().or(z.literal('')),
	phone: z.string().optional().or(z.literal('')),
	
	// Business type and status
	businessType: z.enum(['manufacturer', 'wholesaler', 'trader']),
	isBrand: z.boolean().default(false),
	status: z.enum(['active', 'pending', 'suspended', 'rejected']).default('pending'),
	adminNotes: z.string().optional(),
	logoInitials: z.string().optional(),
	description: z.string().max(MAX_DESCRIPTION_LENGTH).optional(),
	coverImage: z.string().url().max(MAX_URL_LENGTH).optional(),
	
	// Company details
	yearEstablished: z.number()
		.int()
		.min(1900, "Establishment year must be >= 1900")
		.max(new Date().getFullYear() + 1, "Year cannot be in the future")
		.optional(),
	employeeCount: z.string().optional(),
	productionCapacity: z.string().optional(),
	mainMarkets: z.array(z.string()).optional().default([]),
	certifications: z.array(z.any()).optional().default([]),
});

// ==================== Certifying Bodies Schema ====================
export const CertifyingBodiesSchema = BaseMetaSchema.extend({
	name: z.string()
		.min(MIN_NAME_LENGTH, "Name must be at least 2 characters")
		.max(MAX_NAME_LENGTH, "Name exceeds 200 characters")
		.transform(s => s.trim()),
	
	country: CountrySchema,
	standard: z.string().optional(),
	website: z.string()
		.regex(/^https?:\/\//i, "Website must start with http:// or https://")
		.optional(),
	description: z.string().max(MAX_DESCRIPTION_LENGTH).optional(),
	status: z.enum(['active', 'pending', 'inactive']).default('active'),
	email: z.string().email("Valid email is required").optional(),
	phone: z.string().optional(),
});

// ==================== Market Guides Schema ====================
export const MarketGuidesSchema = BaseMetaSchema.extend({
	slug: z.string().min(1).max(100),
	country: CountrySchema,
	flag: z.string().optional(),
	region: RegionSchema,
	muslimPopulation: z.string().optional(),
	totalPopulation: z.string().optional(),
	marketSizeUsd: z.string().optional(),
	mandateStatus: z.enum(['mandatory', 'voluntary', 'phasing-in', 'undefined']).optional(),
	mandatorySince: z.string().optional(),
	
	certifyingBodies: z.array(z.object({
		slug: z.string(),
		name: z.string(),
	})).optional(),
	
	importRequirements: z.array(z.string()).optional(),
	standardBasis: z.string().optional(),
	certificateValidity: z.string().optional(),
	estimatedCostUsd: z.string().optional(),
	processingTime: z.string().optional(),
	
	keyInsights: z.array(z.string()).optional(),
	opportunities: z.array(z.string()).optional(),
	challenges: z.array(z.string()).optional(),
	summary: z.string().optional(),
	status: z.enum(['active', 'draft', 'archived']).default('active'),
});

// ==================== Categories Schema ====================
export const CategoriesSchema = BaseMetaSchema.extend({
	slug: z.string().min(1).max(100),
	name: z.string()
		.min(MIN_NAME_LENGTH, "Category name is required")
		.max(MAX_NAME_LENGTH, "Category name too long")
		.transform(s => s.trim()),
	
	description: z.string().max(MAX_DESCRIPTION_LENGTH).optional(),
	parentSlug: z.string().nullable(),
	icon: z.string().optional(),
	status: z.enum(['active', 'inactive']).default('active'),
	sortOrder: z.number().int().nonnegative().default(0),
});

// ==================== Validation Helpers ====================
function createValidationErrorResponse(errors: z.ZodError, pathPrefix = ''): any {
	return {
		success: false,
		errors: errors.issues.map(issue => ({
			field: pathPrefix + issue.path.join('.'),
			message: issue.message,
			code: `VALIDATION_ERROR_${issue.path.join('_').toUpperCase()}`,
		})),
		timestamp: Date.now(),
	};
}

// ==================== Educational Data Models ====================

// Knowledge Base Schema
export const KnowledgeBaseSchema = BaseMetaSchema.extend({
	slug: z.string().min(1).max(100),
	section: z.enum([
		'halal-certification',
		'trade-sourcing',
		'logistics',
		'packaging-labeling',
		'country-market-guides',
		'due-diligence'
	]),
	title: z.string(),
	summary: z.string().optional(),
	body: z.string().optional(),
	tags: z.array(z.string()).optional(),
	author: z.string().optional(),
	status: z.enum(['published', 'draft', 'archived']).default('draft'),
	views: z.number().int().nonnegative().default(0),
});

// Service Providers Schema
export const ServiceProvidersSchema = BaseMetaSchema.extend({
	slug: z.string().min(1).max(100),
	name: z.string().min(MIN_NAME_LENGTH, "Name is required").max(MAX_NAME_LENGTH),
	type: z.enum(['certification', 'logistics', 'finance', 'payment', 'insurance', 'consulting']),
	country: CountrySchema,
	description: z.string().optional(),
	website: z.string().regex(/^https?:\/\//i).optional(),
	email: z.string().email().optional(),
	phone: z.string().optional(),
	whatsapp: z.string().optional(),
	line: z.string().optional(),
	rating: z.number().min(0).max(5).optional(),
	status: z.enum(['active', 'pending', 'suspended']).default('pending'),
});

// Trade Shows Schema
export const TradeShowsSchema = BaseMetaSchema.extend({
	id: z.string().min(1),
	name: z.string(),
	city: z.string(),
	country: z.string(),
	region: z.string(),
	startDate: z.string(),
	endDate: z.string(),
	venue: z.string().optional(),
	website: z.string().optional(),
	scale: z.enum(['mini', 'small', 'medium', 'large', 'mega']),
	description: z.string().optional(),
	focus: z.array(z.string()).optional(),
	exhibitors: z.number().optional(),
	visitors: z.number().optional(),
	status: z.enum(['active', 'expired', 'archived']).default('active'),
});

// ==================== IO Types ====================
export type ProductResponse = {
	data: ProductType;
	errors?: ValidationIssue[];
};

export type SupplierResponse = {
	data: SupplierType;
	errors?: ValidationIssue[];
};

export type ValidatedData<T> = {
	data: T;
	errors: ValidationIssue[];
	validated: boolean;
};

export interface ValidationIssue {
	field: string;
	message: string;
	code: string;
	timestamp: number;
}

export interface ValidationResult<T> {
	success: boolean;
	data?: T | null;
	errors?: ValidationIssue[];
	message?: string;
}

// ==================== Export Types ====================
export type ProductType = z.infer<typeof ProductsSchema>;
export type SupplierType = z.infer<typeof SuppliersSchema>;
export type CertifyingBodiesType = z.infer<typeof CertifyingBodiesSchema>;
export type MarketGuidesType = z.infer<typeof MarketGuidesSchema>;
export type CategoriesType = z.infer<typeof CategoriesSchema>;
export type KnowledgeBaseType = z.infer<typeof KnowledgeBaseSchema>;
export type ServiceProvidersType = z.infer<typeof ServiceProvidersSchema>;
export type TradeShowsType = z.infer<typeof TradeShowsSchema>;
