export type BusinessType = 'manufacturer' | 'wholesaler' | 'trader';

export type CertStatus = 'certified' | 'pending' | 'expired';

export interface CertifyingBody {
	id: string;
	name: string;
	country: string;
	standard: string;
}

export interface Certification {
	id: string;
	body: CertifyingBody;
	scope: string;
	status: CertStatus;
	expiry: string;
	number: string;
}

export interface Merchant {
	slug: string;
	name: string;
	country: string;
	businessType: BusinessType;
	isBrand: boolean;
	status: 'active' | 'pending';
	logoInitials: string;
	description: string;
	yearEstablished: number;
	certifications: Certification[];
}

export interface Category {
	slug: string;
	name: string;
	description: string;
	parentSlug?: string;
	icon: string;
}

export interface Sku {
	slug: string;
	merchantSlug: string;
	categorySlug: string;
	name: string;
	shortDescription: string;
	image: string;
	moq: string;
	priceRange: string;
	certStatus: CertStatus;
	units: string;
	originCountry: string;
	features: string[];
}

export type SectionSlug =
	| 'halal-certification'
	| 'trade-sourcing'
	| 'logistics'
	| 'packaging-labeling'
	| 'country-market-guides'
	| 'due-diligence';

export interface KbSection {
	slug: SectionSlug;
	title: string;
	description: string;
	icon: string;
}

export interface KbArticle {
	section: SectionSlug;
	slug: string;
	title: string;
	summary: string;
	tags: string[];
	body: string;
}

export interface GlossaryTerm {
	term: string;
	definition: string;
}

export interface BlogPost {
	slug: string;
	title: string;
	excerpt: string;
	author: string;
	date: string;
	tags: string[];
	status: 'draft' | 'published';
	body: string;
}

export interface AiTool {
	id: string;
	slug: string;
	name: string;
	description: string;
	longDescription: string;
	features: string[];
	category: 'assistant' | 'compliance' | 'sourcing' | 'documentation';
	status: 'active' | 'disabled';
}

export interface SiteSettings {
	siteName: string;
	tagline: string;
	supportEmail: string;
	contactEmail: string;
	enableDemoNotice: boolean;
	enableMaintenanceMode: boolean;
}
