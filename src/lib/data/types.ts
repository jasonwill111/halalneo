export type BusinessType = 'manufacturer' | 'wholesaler' | 'trader';

export type CertStatus = 'certified' | 'pending' | 'not-certified' | 'not-applicable';

export interface CertifyingBody {
	id: string;
	name: string;
	country: string;
	standard: string;
	website?: string;
	description?: string;
	status?: 'active' | 'inactive';
	metaTitle?: string;
	metaDescription?: string;
	keywords?: string;
}

export interface Certification {
	id?: string;
	bodyId: string;
	bodyName: string;
	scope: string;
	status: CertStatus;
	expiry: string;
	number: string;
}

export interface Supplier {
	slug: string;
	name: string;
	country: string;
	businessType: BusinessType;
	isBrand: boolean;
	status: 'active' | 'pending' | 'suspended';
	logoInitials: string;
	description: string;
	coverImage?: string;
	website?: string;
	email?: string;
	phone?: string;
	whatsapp?: string;
	line?: string;
	yearEstablished: number;
	employeeCount?: string;
	productionCapacity?: string;
	mainMarkets?: string[];
	certifications: Certification[];
	metaTitle?: string;
	metaDescription?: string;
	keywords?: string;
}

export interface Category {
	slug: string;
	name: string;
	description: string;
	parentSlug?: string;
	icon: string;
	status?: 'active' | 'inactive';
	sortOrder?: number;
	metaTitle?: string;
	metaDescription?: string;
	keywords?: string;
}

export interface Product {
	slug: string;
	supplierSlug: string;
	categorySlug: string;
	name: string;
	shortDescription: string;
	description?: string;
	image: string;
	images?: string[];
	videos?: string[];
	moq: string;
	priceMin?: number;
	priceMax?: number;
	priceUnit?: string;
	priceRange: string;
	certStatus: CertStatus;
	units: string;
	originCountry: string;
	features: string[];
	specifications?: Record<string, string>;
	faqs?: Array<{ question: string; answer: string }>;
	resources?: Array<{ name: string; url: string }>;
	status?: 'active' | 'draft' | 'archived';
	views?: number;
	metaTitle?: string;
	metaDescription?: string;
	keywords?: string;
}

export type KnowledgeSection =
	| 'halal-certification'
	| 'trade-sourcing'
	| 'logistics'
	| 'packaging-labeling'
	| 'country-market-guides'
	| 'due-diligence';

export interface KnowledgeBase {
	slug: string;
	section: KnowledgeSection;
	title: string;
	summary: string;
	tags: string[];
	body: string;
	author?: string;
	status?: 'published' | 'draft' | 'archived';
	views?: number;
	metaTitle?: string;
	metaDescription?: string;
	keywords?: string;
}

export interface Page {
	slug: string;
	title: string;
	type: 'landing' | 'blog';
	excerpt?: string;
	body: string;
	author?: string;
	category?: string; // For content type: 'blog', 'kb', 'glossary', 'faq'
	featuredImage?: string;
	tags?: string[];
	metaTitle?: string;
	metaDescription?: string;
	keywords?: string[];
	status: 'published' | 'draft' | 'archived';
	views?: number;
	publishedAt?: Date;
}

export interface ServiceProvider {
	slug: string;
	name: string;
	type: 'certification' | 'logistics' | 'finance' | 'payment' | 'insurance' | 'consulting';
	country: string;
	description?: string;
	website?: string;
	email?: string;
	phone?: string;
	whatsapp?: string;
	line?: string;
	rating?: number;
	status: 'active' | 'pending' | 'suspended';
	metaTitle?: string;
	metaDescription?: string;
	keywords?: string;
}

export interface Inquiry {
	id: string;
	buyerSlug: string;
	supplierSlug?: string;
	productSlug?: string;
	subject: string;
	message: string;
	status: 'active' | 'pending' | 'closed' | 'flagged';
}

export interface SiteSettings {
	siteName: string;
	tagline: string;
	supportEmail: string;
	contactEmail: string;
	enableDemoNotice: boolean;
	enableMaintenanceMode: boolean;
}

export interface KbArticle {
	slug: string;
	section: KnowledgeSection;
	title: string;
	summary: string;
	tags: string[];
	body: string;
	author?: string;
	status?: 'published' | 'draft' | 'archived';
	views?: number;
	metaTitle?: string;
	metaDescription?: string;
	keywords?: string;
}

export interface KbSection {
	slug: string;
	title: string;
	description: string;
	icon: string;
}

export interface BlogPost {
	slug: string;
	title: string;
	excerpt?: string;
	featuredImage?: string;
	author?: string;
	date?: string;
	tags?: string[];
	status?: 'published' | 'draft' | 'archived';
	body: string;
}

export interface GlossaryTerm {
	term: string;
	definition: string;
}

export interface AiTool {
	id: string;
	slug: string;
	name: string;
	description: string;
	longDescription: string;
	features: string[];
	category: string;
	status: 'active' | 'disabled';
}

export interface MarketGuide {
	slug: string;
	country: string;
	flag?: string;
	region?: string;
	muslimPopulation?: string;
	totalPopulation?: string;
	marketSizeUsd?: string;
	mandateStatus?: string;
	mandatorySince?: string | null;
	certifyingBodies?: { slug: string; name: string }[];
	importRequirements?: string[];
	standardBasis?: string;
	certificateValidity?: string;
	estimatedCostUsd?: string;
	processingTime?: string;
	keyInsights?: string[];
	opportunities?: string[];
	challenges?: string[];
	summary?: string;
	metaTitle?: string;
	metaDescription?: string;
	keywords?: string;
	status?: 'active' | 'draft' | 'archived';
	createdAt?: Date;
	updatedAt?: Date;
}

export interface TradeShow {
	id: string;
	name: string;
	city?: string;
	country?: string;
	region?: string;
	startDate?: string;
	endDate?: string;
	venue?: string;
	website?: string;
	scale?: string;
	description?: string;
	focus?: string[];
	exhibitors?: number | string;
	visitors?: number | string;
	metaTitle?: string;
	metaDescription?: string;
	keywords?: string;
	status?: 'active' | 'draft' | 'archived';
	createdAt?: Date;
	updatedAt?: Date;
}
