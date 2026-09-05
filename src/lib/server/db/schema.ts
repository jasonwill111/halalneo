import { integer, sqliteTable, text, real, index } from 'drizzle-orm/sqlite-core';

// ==================== Media ====================
export const media = sqliteTable('media', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	key: text('key').notNull().unique(),
	filename: text('filename').notNull(),
	contentType: text('content_type').notNull(),
	size: integer('size').notNull(),
	uploadedBy: text('uploaded_by').notNull(),
	thumbnailKey: text('thumbnail_key'),
	alt: text('alt'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.$defaultFn(() => new Date())
		.notNull()
});

// ==================== Categories ====================
export const categories = sqliteTable('categories', {
	slug: text('slug').primaryKey(),
	name: text('name').notNull(),
	description: text('description'),
	parentSlug: text('parent_slug'),
	icon: text('icon'),
	status: text('status', { enum: ['active', 'inactive'] }).default('active'),
	sortOrder: integer('sort_order').default(0),
	metaTitle: text('meta_title'),
	metaDescription: text('meta_description'),
	keywords: text('keywords'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.$defaultFn(() => new Date())
		.notNull()
});

// ==================== Suppliers ====================
export const suppliers = sqliteTable('suppliers', {
	slug: text('slug').primaryKey(),
	name: text('name').notNull(),
	country: text('country').notNull(),
	businessType: text('business_type', { enum: ['manufacturer', 'wholesaler', 'trader'] }).notNull(),
	isBrand: integer('is_brand', { mode: 'boolean' }).default(false),
	status: text('status', { enum: ['active', 'pending', 'suspended'] }).default('pending'),
	logoInitials: text('logo_initials'),
	description: text('description'),
	coverImage: text('cover_image'),
	website: text('website'),
	email: text('email'),
	phone: text('phone'),
	whatsapp: text('whatsapp'),
	line: text('line'),
	yearEstablished: integer('year_established'),
	employeeCount: text('employee_count'),
	productionCapacity: text('production_capacity'),
	mainMarkets: text('main_markets'), // JSON array
	certifications: text('certifications'), // JSON array of certification objects
	metaTitle: text('meta_title'),
	metaDescription: text('meta_description'),
	keywords: text('keywords'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.$defaultFn(() => new Date())
		.notNull()
});

// ==================== Certifying Bodies ====================
export const certifyingBodies = sqliteTable('certifying_bodies', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text('name').notNull(),
	country: text('country').notNull(),
	standard: text('standard'),
	website: text('website'),
	description: text('description'),
	status: text('status', { enum: ['active', 'pending', 'inactive'] }).default('active'),
	metaTitle: text('meta_title'),
	metaDescription: text('meta_description'),
	keywords: text('keywords'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.$defaultFn(() => new Date())
		.notNull()
});

// ==================== Products ====================
export const products = sqliteTable('products', {
	slug: text('slug').primaryKey(),
	supplierSlug: text('supplier_slug')
		.notNull()
		.references(() => suppliers.slug),
	categorySlug: text('category_slug')
		.notNull()
		.references(() => categories.slug),
	name: text('name').notNull(),
	shortDescription: text('short_description'),
	description: text('description'), // Rich text / HTML
	image: text('image'),
	images: text('images'), // JSON array of image URLs
	videos: text('videos'), // JSON array of video URLs
	moq: text('moq'),
	priceMin: real('price_min'),
	priceMax: real('price_max'),
	priceUnit: text('price_unit'),
	certStatus: text('cert_status', { enum: ['certified', 'pending', 'not-certified', 'not-applicable'] }).default('pending'),
	units: text('units'),
	originCountry: text('origin_country'),
	features: text('features'), // JSON array
	specifications: text('specifications'), // JSON object
	faqs: text('faqs'), // JSON array
	resources: text('resources'), // JSON array of downloadable resources
	status: text('status', { enum: ['active', 'draft', 'archived'] }).default('draft'),
	views: integer('views').default(0),
	metaTitle: text('meta_title'),
	metaDescription: text('meta_description'),
	keywords: text('keywords'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.$defaultFn(() => new Date())
		.notNull()
});

// ==================== Knowledge Base ====================
export const knowledgeBase = sqliteTable('knowledge_base', {
	slug: text('slug').primaryKey(),
	section: text('section', {
		enum: [
			'halal-certification',
			'trade-sourcing',
			'logistics',
			'packaging-labeling',
			'country-market-guides',
			'due-diligence'
		]
	}).notNull(),
	title: text('title').notNull(),
	summary: text('summary'),
	body: text('body'), // Rich text / Markdown
	tags: text('tags'), // JSON array
	author: text('author'),
	status: text('status', { enum: ['published', 'draft', 'archived'] }).default('draft'),
	views: integer('views').default(0),
	metaTitle: text('meta_title'),
	metaDescription: text('meta_description'),
	keywords: text('keywords'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.$defaultFn(() => new Date())
		.notNull()
});

// ==================== Pages (Blog, Static, Marketing, Glossary, FAQ) ====================
export const pages = sqliteTable('pages', {
	slug: text('slug').primaryKey(),
	title: text('title').notNull(),
	type: text('type', { enum: ['landing', 'blog'] }).notNull(),
	excerpt: text('excerpt'),
	body: text('body'), // Rich text / HTML
	author: text('author'),
	category: text('category'),
	featuredImage: text('featured_image'),
	tags: text('tags'), // JSON array
	metaTitle: text('meta_title'),
	metaDescription: text('meta_description'),
	keywords: text('keywords'), // JSON array
	status: text('status', { enum: ['published', 'draft', 'archived'] }).default('draft'),
	views: integer('views').default(0),
	publishedAt: integer('published_at', { mode: 'timestamp' }),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.$defaultFn(() => new Date())
		.notNull()
});

// ==================== Service Providers ====================
export const serviceProviders = sqliteTable('service_providers', {
	slug: text('slug').primaryKey(),
	name: text('name').notNull(),
	type: text('type', {
		enum: ['certification', 'logistics', 'finance', 'payment', 'insurance', 'consulting']
	}).notNull(),
	country: text('country').notNull(),
	description: text('description'),
	website: text('website'),
	email: text('email'),
	phone: text('phone'),
	whatsapp: text('whatsapp'),
	line: text('line'),
	rating: real('rating'),
	status: text('status', { enum: ['active', 'pending', 'suspended'] }).default('pending'),
	metaTitle: text('meta_title'),
	metaDescription: text('meta_description'),
	keywords: text('keywords'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.$defaultFn(() => new Date())
		.notNull()
});

// ==================== Inquiries ====================
export const inquiries = sqliteTable('inquiries', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	buyerSlug: text('buyer_slug').notNull(),
	supplierSlug: text('supplier_slug').references(() => suppliers.slug),
	productSlug: text('product_slug').references(() => products.slug),
	subject: text('subject').notNull(),
	message: text('message').notNull(),
	status: text('status', { enum: ['active', 'pending', 'closed', 'flagged'] }).default('active'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.$defaultFn(() => new Date())
		.notNull()
});

// ==================== Site Settings ====================
export const siteSettings = sqliteTable('site_settings', {
	key: text('key').primaryKey(),
	value: text('value').notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.$defaultFn(() => new Date())
		.notNull()
});

// ==================== Market Guides ====================
export const marketGuides = sqliteTable('market_guides', {
	slug: text('slug').primaryKey(),
	country: text('country').notNull(),
	flag: text('flag').default(''),
	region: text('region').default(''),
	muslimPopulation: text('muslim_population').default(''),
	totalPopulation: text('total_population').default(''),
	marketSizeUsd: text('market_size_usd').default(''),
	mandateStatus: text('mandate_status').default(''),
	mandatorySince: text('mandatory_since').default(''),
	certifyingBodies: text('certifying_bodies', { mode: 'json' }).default([]).$type<{ slug: string; name: string }[]>(),
	importRequirements: text('import_requirements', { mode: 'json' }).default([]).$type<string[]>(),
	standardBasis: text('standard_basis').default(''),
	certificateValidity: text('certificate_validity').default(''),
	estimatedCostUsd: text('estimated_cost_usd').default(''),
	processingTime: text('processing_time').default(''),
	keyInsights: text('key_insights', { mode: 'json' }).default([]).$type<string[]>(),
	opportunities: text('opportunities', { mode: 'json' }).default([]).$type<string[]>(),
	challenges: text('challenges', { mode: 'json' }).default([]).$type<string[]>(),
	summary: text('summary').default(''),
	// SEO fields
	metaTitle: text('meta_title').default(''),
	metaDescription: text('meta_description').default(''),
	keywords: text('keywords').default(''),
	status: text('status').default('active'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

// ==================== Trade Shows ====================
export const tradeShows = sqliteTable('trade_shows', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	city: text('city').default(''),
	country: text('country').default(''),
	region: text('region').default(''),
	startDate: text('start_date').default(''),
	endDate: text('end_date').default(''),
	venue: text('venue').default(''),
	website: text('website').default(''),
	scale: text('scale').default(''),
	description: text('description').default(''),
	focus: text('focus', { mode: 'json' }).default([]).$type<string[]>(),
	exhibitors: integer('exhibitors'),
	visitors: integer('visitors'),
	// SEO fields
	metaTitle: text('meta_title').default(''),
	metaDescription: text('meta_description').default(''),
	keywords: text('keywords').default(''),
	status: text('status').default('active'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

// ==================== Indexes ====================
// Products
export const productsCategoryIdx = index('idx_products_category').on(products.categorySlug);
export const productsSupplierIdx = index('idx_products_supplier').on(products.supplierSlug);
export const productsStatusIdx = index('idx_products_status').on(products.status);
export const productsCertIdx = index('idx_products_cert').on(products.certStatus);
export const productsCreatedAtIdx = index('idx_products_created').on(products.createdAt);
export const productsNameIdx = index('idx_products_name').on(products.name);

// Suppliers
export const suppliersStatusIdx = index('idx_suppliers_status').on(suppliers.status);
export const suppliersCountryIdx = index('idx_suppliers_country').on(suppliers.country);
export const suppliersNameIdx = index('idx_suppliers_name').on(suppliers.name);
export const suppliersBusinessTypeIdx = index('idx_suppliers_business_type').on(suppliers.businessType);

// Pages
export const pagesTypeIdx = index('idx_pages_type').on(pages.type);
export const pagesStatusIdx = index('idx_pages_status').on(pages.status);
export const pagesCategoryIdx = index('idx_pages_category').on(pages.category);
export const pagesPublishedIdx = index('idx_pages_published').on(pages.publishedAt);

// Knowledge Base
export const kbSectionIdx = index('idx_kb_section').on(knowledgeBase.section);
export const kbStatusIdx = index('idx_kb_status').on(knowledgeBase.status);

// Service Providers
export const spTypeIdx = index('idx_sp_type').on(serviceProviders.type);
export const spStatusIdx = index('idx_sp_status').on(serviceProviders.status);
export const spCountryIdx = index('idx_sp_country').on(serviceProviders.country);

// Certifying Bodies (filters by country + status — index both)
export const cbCountryIdx = index('idx_cb_country').on(certifyingBodies.country);
export const cbStatusIdx = index('idx_cb_status').on(certifyingBodies.status);

// Categories (parentSlug filter on hierarchical listing)
export const categoriesParentIdx = index('idx_categories_parent').on(categories.parentSlug);

// Inquiries
export const inquiriesStatusIdx = index('idx_inquiries_status').on(inquiries.status);
export const inquiriesBuyerIdx = index('idx_inquiries_buyer').on(inquiries.buyerSlug);
export const inquiriesSupplierIdx = index('idx_inquiries_supplier').on(inquiries.supplierSlug);

// Media
export const mediaKeyIdx = index('idx_media_key').on(media.key);

// Market Guides
export const mgCountryIdx = index('idx_mg_country').on(marketGuides.country);
export const mgStatusIdx = index('idx_mg_status').on(marketGuides.status);

// Trade Shows
export const tsCountryIdx = index('idx_ts_country').on(tradeShows.country);
export const tsStatusIdx = index('idx_ts_status').on(tradeShows.status);
export const tsStartDateIdx = index('idx_ts_start_date').on(tradeShows.startDate);

// Auth tables are provided by Better Auth
export * from './auth.schema';
