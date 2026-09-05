CREATE INDEX IF NOT EXISTS idx_suppliers_business_type ON suppliers (usiness_type);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_sp_country ON service_providers (country);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_inquiries_supplier ON inquiries (supplier_slug);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_cb_country ON certifying_bodies (country);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_cb_status ON certifying_bodies (status);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories (parent_slug);
