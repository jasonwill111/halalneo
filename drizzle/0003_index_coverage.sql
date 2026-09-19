-- Index coverage for src/lib/server/db/schema.ts (§5.9.1/§5.9.2 cost red line).
--
-- Every index declared in the schema is reproduced here with IF NOT EXISTS, so
-- this file converges any environment: the local dev D1 already carries most of
-- them (created by `pnpm db:push`), while a fresh/remote D1 may be missing the
-- ones that were never migrated (see 0002_add_indexes.sql, which was also
-- corrupted by a stray backspace byte in `business_type`).
--
-- Not included: idx_ai_tools_status / idx_ai_tools_category — those tables are
-- introduced by their own migration; indexing a missing table would abort here.
--
-- Estimated cost: one-shot DDL, no row scans. Reads that gain an index:
-- products (category_slug, supplier_slug, status, cert_status, created_at,
-- name), suppliers (status, country, name, business_type), pages (type, status,
-- category, published_at), knowledge_base (section, status), service_providers
-- (type, status, country), certifying_bodies (country, status),
-- categories (parent_slug), inquiries (status, buyer_slug, supplier_slug),
-- buying_requests (status, buyer_id, category_slug), promotions (status,
-- supplier_slug), supplier_members/supplier_updates/follows/success_stories/
-- page_views/media/market_guides/trade_shows lookups.

-- Products
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category_slug);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products (supplier_slug);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_products_status ON products (status);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_products_cert ON products (cert_status);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_products_created ON products (created_at);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_products_name ON products (name);--> statement-breakpoint

-- Suppliers
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers (status);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_suppliers_country ON suppliers (country);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers (name);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_suppliers_business_type ON suppliers (business_type);--> statement-breakpoint

-- Pages
CREATE INDEX IF NOT EXISTS idx_pages_type ON pages (type);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages (status);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_pages_category ON pages (category);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_pages_published ON pages (published_at);--> statement-breakpoint

-- Knowledge Base
CREATE INDEX IF NOT EXISTS idx_kb_section ON knowledge_base (section);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_kb_status ON knowledge_base (status);--> statement-breakpoint

-- Service Providers
CREATE INDEX IF NOT EXISTS idx_sp_type ON service_providers (type);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_sp_status ON service_providers (status);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_sp_country ON service_providers (country);--> statement-breakpoint

-- Certifying Bodies
CREATE INDEX IF NOT EXISTS idx_cb_country ON certifying_bodies (country);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_cb_status ON certifying_bodies (status);--> statement-breakpoint

-- Categories
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories (parent_slug);--> statement-breakpoint

-- Inquiries
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries (status);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_inquiries_buyer ON inquiries (buyer_slug);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_inquiries_supplier ON inquiries (supplier_slug);--> statement-breakpoint

-- Buying Requests
CREATE INDEX IF NOT EXISTS idx_rfq_status ON buying_requests (status);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_rfq_buyer ON buying_requests (buyer_id);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_rfq_category ON buying_requests (category_slug);--> statement-breakpoint

-- Promotions
CREATE INDEX IF NOT EXISTS idx_promo_status ON promotions (status);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_promo_supplier ON promotions (supplier_slug);--> statement-breakpoint

-- Supplier Members / Follows / Updates
CREATE INDEX IF NOT EXISTS idx_members_user ON supplier_members (user_id);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_follows_user ON follows (user_id);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_updates_supplier ON supplier_updates (supplier_slug);--> statement-breakpoint

-- Page Views
CREATE INDEX IF NOT EXISTS idx_views_slug ON page_views (kind, slug);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_views_time ON page_views (created_at);--> statement-breakpoint

-- Success Stories
CREATE INDEX IF NOT EXISTS idx_stories_status ON success_stories (status);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_stories_supplier ON success_stories (supplier_slug);--> statement-breakpoint

-- Media
CREATE INDEX IF NOT EXISTS idx_media_key ON media (key);--> statement-breakpoint

-- Market Guides
CREATE INDEX IF NOT EXISTS idx_mg_country ON market_guides (country);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_mg_status ON market_guides (status);--> statement-breakpoint

-- Trade Shows
CREATE INDEX IF NOT EXISTS idx_ts_country ON trade_shows (country);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_ts_status ON trade_shows (status);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_ts_start_date ON trade_shows (start_date);
