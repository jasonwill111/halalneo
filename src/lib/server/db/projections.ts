// Explicit column projections for the content-collection read endpoints
// (Project Rules §5.9 — no SELECT *). Each map lists exactly the columns the
// public pages, admin tables and detail endpoints consume, so D1 reads stay
// narrow and predictable.

import { aiTools, inquiries, marketGuides, pages, tradeShows } from '#lib/server/db/schema.js';

export const marketGuideColumns = {
	slug: marketGuides.slug,
	country: marketGuides.country,
	flag: marketGuides.flag,
	region: marketGuides.region,
	muslimPopulation: marketGuides.muslimPopulation,
	totalPopulation: marketGuides.totalPopulation,
	marketSizeUsd: marketGuides.marketSizeUsd,
	mandateStatus: marketGuides.mandateStatus,
	mandatorySince: marketGuides.mandatorySince,
	certifyingBodies: marketGuides.certifyingBodies,
	importRequirements: marketGuides.importRequirements,
	standardBasis: marketGuides.standardBasis,
	certificateValidity: marketGuides.certificateValidity,
	estimatedCostUsd: marketGuides.estimatedCostUsd,
	processingTime: marketGuides.processingTime,
	keyInsights: marketGuides.keyInsights,
	opportunities: marketGuides.opportunities,
	challenges: marketGuides.challenges,
	summary: marketGuides.summary,
	metaTitle: marketGuides.metaTitle,
	metaDescription: marketGuides.metaDescription,
	keywords: marketGuides.keywords,
	status: marketGuides.status,
	updatedAt: marketGuides.updatedAt
};

export const tradeShowColumns = {
	id: tradeShows.id,
	name: tradeShows.name,
	city: tradeShows.city,
	country: tradeShows.country,
	region: tradeShows.region,
	startDate: tradeShows.startDate,
	endDate: tradeShows.endDate,
	venue: tradeShows.venue,
	website: tradeShows.website,
	scale: tradeShows.scale,
	description: tradeShows.description,
	focus: tradeShows.focus,
	exhibitors: tradeShows.exhibitors,
	visitors: tradeShows.visitors,
	metaTitle: tradeShows.metaTitle,
	metaDescription: tradeShows.metaDescription,
	keywords: tradeShows.keywords,
	status: tradeShows.status,
	updatedAt: tradeShows.updatedAt
};

/**
 * List projection for `pages`. `body` stays because the glossary/search pages
 * read definitions straight off the list endpoint; SEO columns are only served
 * by the single-page detail endpoint.
 */
export const pageListColumns = {
	slug: pages.slug,
	title: pages.title,
	type: pages.type,
	excerpt: pages.excerpt,
	body: pages.body,
	author: pages.author,
	category: pages.category,
	featuredImage: pages.featuredImage,
	tags: pages.tags,
	status: pages.status,
	views: pages.views,
	publishedAt: pages.publishedAt,
	updatedAt: pages.updatedAt
};

/** Detail projection for `pages` (SEO fields included). */
export const pageColumns = {
	...pageListColumns,
	metaTitle: pages.metaTitle,
	metaDescription: pages.metaDescription,
	keywords: pages.keywords,
	createdAt: pages.createdAt
};

export const inquiryColumns = {
	id: inquiries.id,
	buyerSlug: inquiries.buyerSlug,
	supplierSlug: inquiries.supplierSlug,
	productSlug: inquiries.productSlug,
	subject: inquiries.subject,
	message: inquiries.message,
	status: inquiries.status,
	createdAt: inquiries.createdAt,
	updatedAt: inquiries.updatedAt
};

export const aiToolColumns = {
	id: aiTools.id,
	slug: aiTools.slug,
	name: aiTools.name,
	description: aiTools.description,
	longDescription: aiTools.longDescription,
	features: aiTools.features,
	category: aiTools.category,
	status: aiTools.status,
	updatedAt: aiTools.updatedAt
};
