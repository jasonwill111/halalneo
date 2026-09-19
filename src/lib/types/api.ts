/**
 * Wire DTOs for the public board endpoints (`/api/promotions`, `/api/rfqs`,
 * `/api/success-stories`, `/api/supplier-updates`, `/api/follows`,
 * `/api/supplier-memberships`, `/api/search`, KB listings).
 *
 * Content types that already ship a shared DTO next to their Zod schema
 * (products, suppliers, categories, market guides, pages, blog, KB admin rows,
 * trade shows, service providers, certifying bodies, glossary) are imported from
 * `#lib/schemas/*.js` by their consumers instead of duplicated here.
 *
 * §5.4 — the `fetch()` boundary in `+page.ts` loaders must land on a real type,
 * never `any`. Dates cross JSON as ISO strings, so timestamp columns are `string`.
 */
import type { CertStatus, KnowledgeSection } from './index.js';

/** List envelope shared by every paginated `/api` endpoint (§5.9.4). */
export interface ApiList<T> {
	items?: T[];
	total?: number;
	limit?: number;
	offset?: number;
}

// ==================== Knowledge base ====================

/** Public KB article rows (`KB_PUBLIC_COLUMNS` — no body). */
export interface KbArticleListItem {
	slug: string;
	section: KnowledgeSection;
	title: string;
	summary: string | null;
	tags: string | string[] | null;
	author: string | null;
	status: string | null;
	views: number | null;
	updatedAt?: string | null;
	body?: string | null;
}

/** `/api/knowledge-base/sections` — published article count per section. */
export interface KbSectionCountItem {
	section: KnowledgeSection;
	count: number;
}

// ==================== Promotions (quick deals) ====================

export interface PromotionItem {
	id: string;
	supplierSlug: string;
	productSlug: string | null;
	title: string;
	description: string | null;
	discountPct: number | null;
	priceMin: string | null;
	priceMax: string | null;
	priceUnit: string | null;
	moq: string | null;
	validUntil: string | null;
	status: string | null;
	views?: number | null;
	createdAt?: string | null;
	updatedAt?: string | null;
}

// ==================== Buying requests (RFQ board) ====================

export interface BuyingRequestItem {
	id: string;
	buyerId?: string | null;
	buyerEmail?: string | null;
	buyerCountry: string | null;
	title: string;
	description: string | null;
	categorySlug: string | null;
	quantity: string | null;
	targetPrice: string | null;
	destination: string | null;
	status: string | null;
	views?: number | null;
	createdAt?: string | null;
	updatedAt?: string | null;
}

// ==================== Success stories ====================

export interface SuccessStoryItem {
	slug: string;
	title: string;
	excerpt: string | null;
	body?: string | null;
	supplierSlug: string | null;
	buyerCountry: string | null;
	dealValue: string | null;
	image: string | null;
	status?: string | null;
	/** No `published_at` column exists on `success_stories`; JSON-LD reads it defensively. */
	publishedAt?: string | null;
	createdAt?: string | null;
	updatedAt?: string | null;
}

// ==================== Supplier workspace (updates / members / follows) ====================

export interface SupplierUpdateItem {
	id: string;
	supplierSlug: string;
	body: string;
	image: string | null;
	status: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface SupplierMembershipItem {
	userId: string;
	supplierSlug: string;
	role: string | null;
	createdAt?: string;
}

/** One followed supplier, joined from `/api/follows` (no supplier rows → nulls). */
export interface FollowItem {
	supplierSlug: string | null;
	name: string | null;
	country: string | null;
	logoInitials: string | null;
	createdAt: string;
}

// ==================== Search ====================

export interface SearchProductItem {
	slug: string;
	name: string;
	shortDescription: string | null;
	categorySlug: string;
	priceMin: number | null;
	originCountry: string | null;
	certStatus: CertStatus | null;
	/** Suppliers' JSON TEXT column — raw string until the page parses it. */
	certifications: string | unknown[] | null;
	features: string | unknown[] | null;
}

export interface SearchSupplierItem {
	slug: string;
	name: string;
	country: string;
	description: string | null;
	certifications: string | unknown[] | null;
}

export interface SearchArticleItem {
	slug: string;
	title: string;
	summary: string | null;
	tags: string | string[] | null;
	section: KnowledgeSection;
}

export interface SearchTermItem {
	term: string;
	definition: string;
}

/** `/api/search?q=` payload. */
export interface SearchResults {
	products?: SearchProductItem[];
	suppliers?: SearchSupplierItem[];
	articles?: SearchArticleItem[];
	terms?: SearchTermItem[];
}
