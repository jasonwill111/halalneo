import { integer, sqliteTable, text, real, index, json } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { z } from 'zod';

// ==================== Validation Schemas (Zod) ====================

// Product Validation
export const productValidationSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  supplierSlug: z.string().min(1, 'Supplier is required'),
  categorySlug: z.string().min(1, 'Category is required'),
  name: z.string().min(1, 'Product name is required'),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  image: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  videos: z.array(z.string().url()).optional(),
  moq: z.string().optional(),
  priceMin: z.number().positive('Price must be positive'),
  priceMax: z.number().positive().optional(),
  priceUnit: z.string().optional(),
  certStatus: z.enum(['certified', 'pending', 'not-certified', 'not-applicable']).optional(),
  units: z.string().optional(),
  originCountry: z.string().optional(),
  features: z.array(z.any()).optional(),
  specifications: z.record(z.string()).optional(),
  faqs: z.array(z.any()).optional(),
  resources: z.array(z.any()).optional(),
  status: z.enum(['active', 'draft', 'archived']).default('draft'),
  paymentTerms: z.string().optional(),
  shippingTerms: z.string().optional(),
  halalLotNumbers: z.array(z.string()).optional(),
  complianceDocs: z.array(
    z.object({
      type: z.string(),
      url: z.string().url()
    })
  ).optional(),
  shelfLife: z.string().optional(),
  storageRequirements: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.string().optional(),
});

// Supplier Validation
export const supplierValidationSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  name: z.string().min(1, 'Name is required'),
  country: z.string().min(1, 'Country is required'),
  businessType: z.enum(['manufacturer', 'wholesaler', 'trader']),
  isBrand: z.boolean().optional(),
  status: z.enum(['active', 'pending', 'suspended', 'rejected']).default('pending'),
  adminNotes: z.string().optional(),
  logoInitials: z.string().optional(),
  description: z.string().optional(),
  coverImage: z.string().url().optional(),
  website: z.string().url().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  line: z.string().optional(),
  yearEstablished: z.number().optional(),
  employeeCount: z.string().optional(),
  productionCapacity: z.string().optional(),
  mainMarkets: z.array(z.string()).optional(),
  certifications: z.array(
    z.object({
      name: z.string(),
      bodyId: z.string().optional(),
      standard: z.string().optional(),
      scope: z.string().optional(),
      number: z.string().optional(),
      expiry: z.string().optional(),
      status: z.enum(['certified', 'pending', 'expired'])
    })
  ).optional(),
  logoImage: z.string().url().optional(),
  facilityPhotos: z.array(z.string().url()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.string().optional(),
});

// Certifying Body Validation
export const certifyingBodyValidationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  country: z.string().min(1, 'Country is required'),
  standard: z.string().optional(),
  website: z.string().url().optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'pending', 'inactive']).default('active'),
  logoImage: z.string().url().optional(),
  recognizes: z.array(z.string()).optional(),
  mutualRecognition: z.array(
    z.object({
      country: z.string(),
      agreement: z.string(),
      effectiveDate: z.string(),
      scope: z.string()
    })
  ).optional(),
  applicationProcess: z.string().optional(),
  contactEmail: z.string().email().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.string().optional(),
});

// Market Guide Validation
export const marketGuideValidationSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  country: z.string().min(1, 'Country is required'),
  flag: z.string().url().optional(),
  region: z.enum(['Southeast Asia', 'Middle East', 'South Asia', 'Europe', 'East Asia', 'North America']),
  muslimPopulation: z.string().optional(),
  totalPopulation: z.string().optional(),
  marketSizeUsd: z.string().optional(),
  mandateStatus: z.string().optional(),
  mandatorySince: z.string().optional(),
  certifyingBodies: z.array(
    z.object({
      slug: z.string(),
      name: z.string()
    })
  ).optional(),
  importRequirements: z.array(z.string()).optional(),
  standardBasis: z.string().optional(),
  certificateValidity: z.string().optional(),
  estimatedCostUsd: z.string().optional(),
  processingTime: z.string().optional(),
  keyInsights: z.array(z.string()).optional(),
  opportunities: z.array(z.string()).optional(),
  challenges: z.array(z.string()).optional(),
  summary: z.string().optional(),
  visitorsSurplus: z.string().optional(),
  importGrowingSince: z.string().optional(),
  digitalAdoptionRate: z.number().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.string().optional(),
  status: z.enum(['active', 'draft', 'archived']).default('active'),
});

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

// ==================== Suppliers (ENHANCED) ====================
export const suppliers = sqliteTable('suppliers', {
  slug: text('slug').primaryKey(),
  name: text('name').notNull(),
  country: text('country').notNull(),
  businessType: text('business_type', { enum: ['manufacturer', 'wholesaler', 'trader'] }).notNull(),
  isBrand: integer('is_brand', { mode: 'boolean' }).default(false),
  status: text('status', { enum: ['active', 'pending', 'suspended', 'rejected'] }).default('pending'),
  adminNotes: text('admin_notes'),
  
  // Branding
  logoInitials: text('logo_initials'),
  logoImage: text('logo_image'), // Enhanced: Logo image URL
  coverImage: text('cover_image'),
  
  // Description
  description: text('description'),
  
  // Contact Information (validated)
  website: text('website'),
  email: text('email'),
  phone: text('phone'),
  whatsapp: text('whatsapp'),
  line: text('line'),
  
  // Company Details
  yearEstablished: integer('year_established'),
  employeeCount: text('employee_count'),
  productionCapacity: text('production_capacity'),
  
  // Markets & Certifications (JSON)
  mainMarkets: text('main_markets', { mode: 'json' }).$type<string[]>().default([]),
  certifications: text('certifications', { mode: 'json' })
    .$type<Array<{
      name: string;
      bodyId?: string;
      standard?: string;
      scope?: string;
      number?: string;
      expiry?: string;
      status: 'certified' | 'pending' | 'expired';
    }>>().default([]),
  
  // Facility Photos (JSON array)
  facilityPhotos: text('facility_photos', { mode: 'json' })
    .$type<string[]>()
    .default([]),
  
  // SEO fields
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  keywords: text('keywords'),
  
  // Timestamps
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull()
});

// ==================== Certifying Bodies (ENHANCED) ====================
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
  
  // Branding
  logoImage: text('logo_image'), // Enhanced: Logo image URL
  
  // Recognition & Mutual Agreements
  recognizes: text('recognizes', { mode: 'json' })
    .$type<string[]>()
    .default([]),
  mutualRecognition: text('mutual_recognition', { mode: 'json' })
    .$type<Array<{
      country: string;
      agreement: string;
      effectiveDate: string;
      scope: string;
    }>>()
    .default([]),
  
  // Contact & Process
  applicationProcess: text('application_process'), // Enhanced: Application process
  contactEmail: text('contact_email'), // Enhanced: Direct contact email
  
  // SEO fields
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  keywords: text('keywords'),
  
  // Timestamps
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull()
});

// ==================== Products (ENHANCED) ====================
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
  image: text('image'), // Enhanced: Primary image URL
  images: text('images', { mode: 'json' }) // Enhanced: Multiple images JSON array
    .$type<string[]>()
    .default([]),
  videos: text('videos', { mode: 'json' })
    .$type<string[]>()
    .default([]),
  moq: text('moq'),
  priceMin: real('price_min'),
  priceMax: real('price_max'),
  priceUnit: text('price_unit'),
  certStatus: text('cert_status', { enum: ['certified', 'pending', 'not-certified', 'not-applicable'] }).default('pending'),
  units: text('units'),
  originCountry: text('origin_country'),
  features: text('features', { mode: 'json' }).default([]).$type<any[]>(),
  specifications: text('specifications', { mode: 'json' }).$type<Record<string, string>>(),
  faqs: text('faqs', { mode: 'json' }).default([]).$type<any[]>(),
  resources: text('resources', { mode: 'json' }).default([]).$type<any[]>(),
  status: text('status', { enum: ['active', 'draft', 'archived'] }).default('draft'),
  views: integer('views').default(0),
  
  // ENHANCED: Halal Certification & Compliance
  paymentTerms: text('payment_terms'), // Enhanced: Payment terms
  shippingTerms: text('shipping_terms'), // Enhanced: Incoterms
  halalLotNumbers: text('halal_lot_numbers', { mode: 'json' }) // Enhanced: Certified batches
    .$type<string[]>()
    .default([]),
  complianceDocs: text('compliance_docs', { mode: 'json' }) // Enhanced: Compliance documentation
    .$type<Array<{ type: string; url: string }>>()
    .default([]),
  shelfLife: text('shelf_life'), // Enhanced: Product shelf life
  storageRequirements: text('storage_requirements'), // Enhanced: Storage requirements
  
  // SEO fields
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  keywords: text('keywords'),
  
  // Timestamps
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
  tags: text('tags', { mode: 'json' }).$type<string[]>().default([]),
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
  tags: text('tags', { mode: 'json' }).$type<string[]>().default([]),
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

// ==================== Market Guides (ENHANCED) ====================
export const marketGuides = sqliteTable('market_guides', {
  slug: text('slug').primaryKey(),
  country: text('country').notNull(),
  
  // Visual & Regional
  flag: text('flag'), // Enhanced: Flag image URL
  region: text('region', { 
    enum: ['Southeast Asia', 'Middle East', 'South Asia', 'Europe', 'East Asia', 'North America']
  }).notNull(),
  
  // Demographics
  muslimPopulation: text('muslim_population'),
  totalPopulation: text('total_population'),
  
  // Market Data
  marketSizeUsd: text('market_size_usd'),
  
  // Halal Mandate
  mandateStatus: text('mandate_status'),
  mandatorySince: text('mandatory_since'),
  
  // Certifications
  certifyingBodies: text('certifying_bodies', { mode: 'json' })
    .default([])
    .$type<{ slug: string; name: string }[]>(),
  importRequirements: text('import_requirements', { mode: 'json' })
    .default([])
    .$type<string[]>(),
  
  // Standards & Process
  standardBasis: text('standard_basis'),
  certificateValidity: text('certificate_validity'),
  estimatedCostUsd: text('estimated_cost_usd'),
  processingTime: text('processing_time'),
  
  // Insights
  keyInsights: text('key_insights', { mode: 'json' })
    .default([])
    .$type<string[]>(),
  opportunities: text('opportunities', { mode: 'json' })
    .default([])
    .$type<string[]>(),
  challenges: text('challenges', { mode: 'json' })
    .default([])
    .$type<string[]>(),
  
  summary: text('summary'),
  
  // ENHANCED: Structured Data Fields
  visitorsSurplus: text('visitors_surplus'), // Enhanced: Visitor balance data
  importGrowingSince: text('importGrowingSince'), // Enhanced: Import growth indication
  digitalAdoptionRate: integer('digital_adoption_rate'), // Enhanced: Digital adoption percentage
  
  // SEO fields
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  keywords: text('keywords'),
  status: text('status', { enum: ['active', 'draft', 'archived'] }).default('active'),
  
  // Timestamps
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
  status: text('status', { enum: ['active', 'expired', 'archived'] }).default('active'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

// ==================== Buying Requests (public RFQ board) ====================
export const buyingRequests = sqliteTable('buying_requests', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  buyerId: text('buyer_id'),
  buyerEmail: text('buyer_email'),
  buyerCountry: text('buyer_country').default(''),
  title: text('title').notNull(),
  description: text('description').default(''),
  categorySlug: text('category_slug'),
  quantity: text('quantity').default(''),
  targetPrice: text('target_price').default(''),
  destination: text('destination').default(''),
  status: text('status', { enum: ['active', 'closed', 'expired', 'flagged'] }).default('active'),
  views: integer('views').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

// ==================== Promotions (Quick Deals / inventory clearance) ====================
export const promotions = sqliteTable('promotions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  supplierSlug: text('supplier_slug').notNull(),
  productSlug: text('product_slug'),
  title: text('title').notNull(),
  description: text('description').default(''),
  discountPct: integer('discount_pct'),
  priceMin: text('price_min'),
  priceMax: text('price_max'),
  priceUnit: text('price_unit'),
  moq: text('moq'),
  validUntil: text('valid_until'),
  status: text('status', { enum: ['active', 'expired', 'archived'] }).default('active'),
  views: integer('views').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

// ==================== Supplier Members (user <-> supplier link) ====================
export const supplierMembers = sqliteTable('supplier_members', {
  userId: text('user_id').notNull(),
  supplierSlug: text('supplier_slug').notNull(),
  role: text('role').default('owner'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

// ==================== Follows (buyers follow suppliers) ====================
export const follows = sqliteTable('follows', {
  userId: text('user_id').notNull(),
  supplierSlug: text('supplier_slug').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

// ==================== Supplier Updates (supplier posts feed) ====================
export const supplierUpdates = sqliteTable('supplier_updates', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  supplierSlug: text('supplier_slug').notNull(),
  body: text('body').notNull(),
  image: text('image'),
  status: text('status', { enum: ['active', 'archived'] }).default('active'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

// ==================== Page Views (analytics beacon) ====================
export const pageViews = sqliteTable('page_views', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  kind: text('kind').notNull(),
  slug: text('slug').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

// ==================== Success Stories ====================
export const successStories = sqliteTable('success_stories', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  excerpt: text('excerpt').default(''),
  body: text('body').default(''),
  supplierSlug: text('supplier_slug'),
  buyerCountry: text('buyer_country').default(''),
  dealValue: text('deal_value').default(''),
  image: text('image'),
  status: text('status', { enum: ['draft', 'published', 'archived'] }).default('draft'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

// ==================== INDEXES ====================

// Products - Enhanced indexes
export const productsCategoryIdx = index('idx_products_category').on(products.categorySlug);
export const productsSupplierIdx = index('idx_products_supplier').on(products.supplierSlug);
export const productsStatusIdx = index('idx_products_status').on(products.status);
export const productsCertIdx = index('idx_products_cert').on(products.certStatus);
export const productsCreatedAtIdx = index('idx_products_created').on(products.createdAt);
export const productsNameIdx = index('idx_products_name').on(products.name);

// NEW: Enhanced Product indexes for P0 optimization
export const productsPaymentIdx = index('idx_products_payment').on(products.paymentTerms);
export const productsShippingIdx = index('idx_products_shipping').on(products.shippingTerms);
export const productsHalalIdx = index('idx_products_halal').on(products.halalLotNumbers);
export const productsShelfLifeIdx = index('idx_products_shelflife').on(products.shelfLife);
export const productsStorageIdx = index('idx_products_storage').on(products.storageRequirements);
export const productsComplianceIdx = index('idx_products_compliance').on(products.complianceDocs);

// Suppliers - Enhanced indexes
export const suppliersStatusIdx = index('idx_suppliers_status').on(suppliers.status);
export const suppliersCountryIdx = index('idx_suppliers_country').on(suppliers.country);
export const suppliersNameIdx = index('idx_suppliers_name').on(suppliers.name);
export const suppliersBusinessTypeIdx = index('idx_suppliers_business_type').on(suppliers.businessType);

// NEW: New supplier indexes for new fields
export const suppliersLogoIdx = index('idx_suppliers_logo').on(suppliers.logoImage);
export const suppliersCertificationsIdx = index('idx_suppliers_certifications').on(suppliers.certifications);
export const suppliersMainMarketsIdx = index('idx_suppliers_main_markets').on(suppliers.mainMarkets);

// Certifying Bodies - Enhanced indexes
export const cbCountryIdx = index('idx_cb_country').on(certifyingBodies.country);
export const cbStatusIdx = index('idx_cb_status').on(certifyingBodies.status);

// NEW: Enhanced certifying bodies indexes
export const cbLogoIdx = index('idx_cb_logo').on(certifyingBodies.logoImage);
export const cbRecognizesIdx = index('idx_cb_recognizes').on(certifyingBodies.recognizes);
export const cbContactEmailIdx = index('idx_cb_contact_email').on(certifyingBodies.contactEmail);

// Market Guides - Enhanced indexes
export const mgCountryIdx = index('idx_mg_country').on(marketGuides.country);
export const mgStatusIdx = index('idx_mg_status').on(marketGuides.status);

// NEW: Enhanced market guides indexes for new fields
export const mgRegionIdx = index('idx_mg_region').on(marketGuides.region);
export const mgMuslimPopIdx = index('idx_mg_muslim_pop').on(marketGuides.muslimPopulation);
export const mgMarketSizeIdx = index('idx_mg_market_size').on(marketGuides.marketSizeUsd);
export const mgVisitorsSurplusIdx = index('idx_mg_visitors_surplus').on(marketGuides.visitorsSurplus);
export const mgImportGrowthIdx = index('idx_mg_import_growth').on(marketGuides.importGrowingSince);
export const mgDigitalAdoptionIdx = index('idx_mg_digital_adoption').on(marketGuides.digitalAdoptionRate);

// Pages indexes
export const pagesTypeIdx = index('idx_pages_type').on(pages.type);
export const pagesStatusIdx = index('idx_pages_status').on(pages.status);
export const pagesCategoryIdx = index('idx_pages_category').on(pages.category);
export const pagesPublishedIdx = index('idx_pages_published').on(pages.publishedAt);

// Knowledge Base indexes
export const kbSectionIdx = index('idx_kb_section').on(knowledgeBase.section);
export const kbStatusIdx = index('idx_kb_status').on(knowledgeBase.status);

// Service Providers indexes
export const spTypeIdx = index('idx_sp_type').on(serviceProviders.type);
export const spStatusIdx = index('idx_sp_status').on(serviceProviders.status);
export const spCountryIdx = index('idx_sp_country').on(serviceProviders.country);

// Categories indexes
export const categoriesParentIdx = index('idx_categories_parent').on(categories.parentSlug);

// Inquiries indexes
export const inquiriesStatusIdx = index('idx_inquiries_status').on(inquiries.status);
export const inquiriesBuyerIdx = index('idx_inquiries_buyer').on(inquiries.buyerSlug);
export const inquiriesSupplierIdx = index('idx_inquiries_supplier').on(inquiries.supplierSlug);

// Buying Requests indexes
export const rfqStatusIdx = index('idx_rfq_status').on(buyingRequests.status);
export const rfqBuyerIdx = index('idx_rfq_buyer').on(buyingRequests.buyerId);
export const rfqCategoryIdx = index('idx_rfq_category').on(buyingRequests.categorySlug);

// Promotions indexes
export const promoStatusIdx = index('idx_promo_status').on(promotions.status);
export const promoSupplierIdx = index('idx_promo_supplier').on(promotions.supplierSlug);

// Supplier Members / Follows / Updates indexes
export const membersUserIdx = index('idx_members_user').on(supplierMembers.userId);
export const followsUserIdx = index('idx_follows_user').on(follows.userId);
export const updatesSupplierIdx = index('idx_updates_supplier').on(supplierUpdates.supplierSlug);

// Page Views indexes
export const viewsSlugIdx = index('idx_views_slug').on(pageViews.kind, pageViews.slug);
export const viewsTimeIdx = index('idx_views_time').on(pageViews.createdAt);

// Success Stories indexes
export const storiesStatusIdx = index('idx_stories_status').on(successStories.status);
export const storiesSupplierIdx = index('idx_stories_supplier').on(successStories.supplierSlug);

// Media indexes
export const mediaKeyIdx = index('idx_media_key').on(media.key);

// Trade Shows indexes
export const tsCountryIdx = index('idx_ts_country').on(tradeShows.country);
export const tsStatusIdx = index('idx_ts_status').on(tradeShows.status);
export const tsStartDateIdx = index('idx_ts_start_date').on(tradeShows.startDate);

// ==================== Relations ====================

export const productsRelations = relations(products, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [products.supplierSlug],
    references: [suppliers.slug],
  }),
  category: one(categories, {
    fields: [products.categorySlug],
    references: [categories.slug],
  }),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  products: many(products),
  supplierMembers: many(supplierMembers),
  follows: many(follows),
  supplierUpdates: many(supplierUpdates),
  successStories: many(successStories),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
  parentCategory: one(categories, {
    fields: [categories.parentSlug],
    references: [categories.slug],
  }),
  subCategories: many(categories),
}));

export const certifyingBodiesRelations = relations(certifyingBodies, ({ many }) => ({
  successStories: many(successStories),
}));

export const marketGuidesRelations = relations(marketGuides, ({ many }) => ({
  tradeShows: many(tradeShows),
}));

export const pagesRelations = relations(pages, {});

export const serviceProvidersRelations = relations(serviceProviders, {});

export const inquiriesRelations = relations(inquiries, ({ one }) => ({
  buyer: one(suppliers, {
    fields: [inquiries.buyerSlug],
    references: [suppliers.slug],
  }),
  supplier: one(suppliers, {
    fields: [inquiries.supplierSlug],
    references: [suppliers.slug],
  }),
  product: one(products, {
    fields: [inquiries.productSlug],
    references: [products.slug],
  }),
}));

export const siteSettingsRelations = relations(siteSettings, {});

export const buyingRequestsRelations = relations(buyingRequests, {});

export const promotionsRelations = relations(promotions, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [promotions.supplierSlug],
    references: [suppliers.slug],
  }),
  product: one(products, {
    fields: [promotions.productSlug],
    references: [products.slug],
  }),
}));

export const supplierMembersRelations = relations(supplierMembers, ({ one }) => ({
  user: one(user, {
    fields: [supplierMembers.userId],
    references: [user.id],
  }),
  supplier: one(suppliers, {
    fields: [supplierMembers.supplierSlug],
    references: [suppliers.slug],
  }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  user: one(user, {
    fields: [follows.userId],
    references: [user.id],
  }),
  supplier: one(suppliers, {
    fields: [follows.supplierSlug],
    references: [suppliers.slug],
  }),
}));

export const supplierUpdatesRelations = relations(supplierUpdates, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [supplierUpdates.supplierSlug],
    references: [suppliers.slug],
  }),
}));

export const pageViewsRelations = relations(pageViews, {});

export const successStoriesRelations = relations(successStories, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [successStories.supplierSlug],
    references: [suppliers.slug],
  }),
}));

// ==================== BREAKING CHANGES & MIGRATION GUIDE ====================

/**
 * ENHANCED SCHEMA - Breaking Changes & Migration Guide
 * ====================================================
 *
 * DATE: 2026-09-XX
 * VERSION: 2.0.0
 *
 * BREAKING CHANGES:
 * -----------------
 *
 * 1. PRODUCTS TABLE CHANGES:
 *    - Added JSON fields: images, videos, features, specifications, faqs, resources,
 *      halalLotNumbers, complianceDocs
 *    - Added string fields: paymentTerms, shippingTerms, shelfLife, storageRequirements
 *    - Migration needed: Convert existing images (if stored as comma-separated) to JSON array
 *
 * 2. SUPPLIERS TABLE CHANGES:
 *    - Added JSON fields: certifications, mainMarkets, facilityPhotos
 *    - Enhanced existing fields: logoImage (new field)
 *    - Migration needed: Convert existing certifications string to structured JSON
 *
 * 3. CERTIFYING BODIES TABLE CHANGES:
 *    - Added JSON fields: recognizes, mutualRecognition
 *    - Added string fields: logoImage, applicationProcess, contactEmail
 *    - Migration needed: None if table is newly populated
 *
 * 4. MARKET GUIDES TABLE CHANGES:
 *    - Added structured fields: visitorsSurplus, importGrowingSince, digitalAdoptionRate
 *    - Enhanced region field to use enum (previously string)
 *    - Migration needed: Ensure region values match enum values
 *
 * MIGRATION STRATEGY:
 * -------------------
 *
 * Phase 1: Backup (Recommended)
 * - Export existing data to JSON/CSV
 * - Create database dump
 *
 * Phase 2: Schema Update
 * - Run Drizzle Kit generate to create migration SQL
 * - Apply migration in staging environment first
 *
 * Phase 3: Data Migration
 * - Write migration scripts for data transformation (if needed)
 * - Test data integrity thoroughly
 *
 * Phase 4: Validation
 * - Run Zod validation tests on sample data
 * - Verify all new indexes are created
 * - Check foreign key relationships
 *
 * NEW FEATURES:
 * -------------
 * - Halal certification batch tracking (halalLotNumbers)
 * - Compliance documentation management (complianceDocs)
 * - Enhanced supplier certifications with structured data
 * - Market guide analytics (digitalAdoptionRate, visitorsSurplus)
 * - Payment and shipping terms standardization
 *
 * INDEXING OPTIMIZATIONS:
 * - Added indexes for new query patterns
 * - Optimized for common filter combinations
 * - Improved search performance on key fields
 *
 * VALIDATION IMPROVEMENTS:
 * - All core content types have Zod schemas
 * - Required fields are enforced at application level
 * - Data integrity checks for URLs, emails, numbers
 *
 * BACKWARD COMPATIBILITY:
 * - All new fields are optional (unless specified)
 * - Existing queries should continue to work
 * - Migration scripts can handle data transformation
 *
 * TESTING CHECKLIST:
 * - [ ] Create database backup
 * - [ ] Run Drizzle Kit generate
 * - [ ] Apply migration to staging
 * - [ ] Verify all tables and indexes exist
 * - [ ] Test Zod validation schemas
 * - [ ] Run E2E tests for affected features
 * - [ ] Check performance with new indexes
 * - [ ] Verify data integrity
 *
 * ROLLBACK PLAN:
 * --------------
 * If issues arise, keep previous schema version as fallback:
 * - Use Drizzle Kit rollback
 * - Restore from backup if needed
 * - Deploy hotfix with data migration fix
 */

// ==================== TYPE EXPORTS ====================

// Export types from Zod schemas for TypeScript usage
export type ProductInput = z.infer<typeof productValidationSchema>;
export type SupplierInput = z.infer<typeof supplierValidationSchema>;
export type CertifyingBodyInput = z.infer<typeof certifyingBodyValidationSchema>;
export type MarketGuideInput = z.infer<typeof marketGuideValidationSchema>;

// Export Drizzle table types
export type Product = typeof products.$inferSelect;
export type Supplier = typeof suppliers.$inferSelect;
export type CertifyingBody = typeof certifyingBodies.$inferSelect;
export type MarketGuide = typeof marketGuides.$inferSelect;

export * from './auth.schema';
