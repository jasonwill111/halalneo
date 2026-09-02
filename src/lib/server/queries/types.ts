import type { KnowledgeSection } from '#lib/data/types.js';

export interface PaginationOptions {
	limit?: number;
	offset?: number;
}

export interface SearchOptions {
	search?: string;
}

export interface PaginatedResult<T> {
	items: T[];
	total: number;
	limit: number;
	offset: number;
}

export interface ProductQueryOptions extends PaginationOptions, SearchOptions {
	categorySlug?: string;
	certStatus?: string;
	status?: string;
}

export interface SupplierQueryOptions extends PaginationOptions, SearchOptions {
	status?: string;
	country?: string;
}

export interface KbQueryOptions extends PaginationOptions, SearchOptions {
	section?: KnowledgeSection;
}

export interface BlogQueryOptions extends PaginationOptions, SearchOptions {
	category?: string;
}

export interface PageQueryOptions extends PaginationOptions {
	type?: 'landing' | 'blog';
	status?: string;
}

export interface ServiceProviderQueryOptions extends PaginationOptions, SearchOptions {
	type?: string;
}

export interface CertifyingBodyQueryOptions extends PaginationOptions, SearchOptions {
	country?: string;
}

export interface InquiryQueryOptions extends PaginationOptions {
	status?: string;
	buyerSlug?: string;
}

export interface CreateInquiryData {
	buyerSlug: string;
	supplierSlug?: string;
	productSlug?: string;
	subject: string;
	message: string;
}
