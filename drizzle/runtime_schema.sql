CREATE TABLE IF NOT EXISTS `categories` (
	`slug` text PRIMARY KEY NOT NULL, `name` text NOT NULL, `description` text, `parent_slug` text, `icon` text, `sort_order` integer DEFAULT 0, `status` text DEFAULT 'active', `meta_title` text DEFAULT '', `meta_description` text DEFAULT '', `keywords` text DEFAULT '', `created_at` integer NOT NULL, `updated_at` integer NOT NULL
);
CREATE TABLE IF NOT EXISTS `certifying_bodies` (
	`id` text PRIMARY KEY NOT NULL, `name` text NOT NULL, `country` text NOT NULL, `standard` text, `website` text, `description` text, `status` text DEFAULT 'active', `meta_title` text DEFAULT '', `meta_description` text DEFAULT '', `keywords` text DEFAULT '', `created_at` integer NOT NULL, `updated_at` integer NOT NULL
);
CREATE TABLE IF NOT EXISTS `inquiries` (
	`id` text PRIMARY KEY NOT NULL, `buyer_slug` text NOT NULL, `supplier_slug` text, `product_slug` text, `subject` text NOT NULL, `message` text NOT NULL, `status` text DEFAULT 'active', `created_at` integer NOT NULL, `updated_at` integer NOT NULL,
	FOREIGN KEY (`supplier_slug`) REFERENCES `suppliers`(`slug`), FOREIGN KEY (`product_slug`) REFERENCES `products`(`slug`)
);
CREATE TABLE IF NOT EXISTS `knowledge_base` (
	`slug` text PRIMARY KEY NOT NULL, `section` text NOT NULL, `title` text NOT NULL, `summary` text, `body` text, `tags` text, `author` text, `status` text DEFAULT 'draft', `views` integer DEFAULT 0, `meta_title` text DEFAULT '', `meta_description` text DEFAULT '', `keywords` text DEFAULT '', `created_at` integer NOT NULL, `updated_at` integer NOT NULL
);
CREATE TABLE IF NOT EXISTS `media` (
	`id` text PRIMARY KEY NOT NULL, `key` text NOT NULL, `filename` text NOT NULL, `content_type` text NOT NULL, `size` integer NOT NULL, `uploaded_by` text NOT NULL, `thumbnail_key` text, `alt` text, `created_at` integer NOT NULL
);
CREATE TABLE IF NOT EXISTS `pages` (
	`slug` text PRIMARY KEY NOT NULL, `title` text NOT NULL, `type` text NOT NULL, `excerpt` text, `body` text, `author` text, `category` text, `featured_image` text, `tags` text, `meta_title` text, `meta_description` text, `keywords` text, `status` text DEFAULT 'draft', `views` integer DEFAULT 0, `published_at` integer, `created_at` integer NOT NULL, `updated_at` integer NOT NULL
);
CREATE TABLE IF NOT EXISTS `products` (
	`slug` text PRIMARY KEY NOT NULL, `supplier_slug` text NOT NULL, `category_slug` text NOT NULL, `name` text NOT NULL, `short_description` text, `description` text, `image` text, `images` text, `videos` text, `moq` text, `price_min` real, `price_max` real, `price_unit` text, `cert_status` text DEFAULT 'pending', `units` text, `origin_country` text, `features` text, `specifications` text, `faqs` text, `resources` text, `status` text DEFAULT 'draft', `views` integer DEFAULT 0, `created_at` integer NOT NULL, `updated_at` integer NOT NULL,
	FOREIGN KEY (`supplier_slug`) REFERENCES `suppliers`(`slug`), FOREIGN KEY (`category_slug`) REFERENCES `categories`(`slug`)
);
CREATE TABLE IF NOT EXISTS `service_providers` (
	`slug` text PRIMARY KEY NOT NULL, `name` text NOT NULL, `type` text NOT NULL, `country` text NOT NULL, `description` text, `website` text, `email` text, `phone` text, `whatsapp` text, `line` text, `rating` real, `status` text DEFAULT 'pending', `meta_title` text DEFAULT '', `meta_description` text DEFAULT '', `keywords` text DEFAULT '', `created_at` integer NOT NULL, `updated_at` integer NOT NULL
);
CREATE TABLE IF NOT EXISTS `site_settings` (
	`key` text PRIMARY KEY NOT NULL, `value` text NOT NULL, `updated_at` integer NOT NULL
);
CREATE TABLE IF NOT EXISTS `suppliers` (
	`slug` text PRIMARY KEY NOT NULL, `name` text NOT NULL, `country` text NOT NULL, `business_type` text NOT NULL, `is_brand` integer DEFAULT false, `status` text DEFAULT 'pending', `logo_initials` text, `description` text, `cover_image` text, `website` text, `email` text, `phone` text, `whatsapp` text, `line` text, `year_established` integer, `employee_count` text, `production_capacity` text, `main_markets` text, `certifications` text, `meta_title` text DEFAULT '', `meta_description` text DEFAULT '', `keywords` text DEFAULT '', `created_at` integer NOT NULL, `updated_at` integer NOT NULL
);
CREATE TABLE IF NOT EXISTS `market_guides` (
	`slug` text PRIMARY KEY NOT NULL, `country` text NOT NULL, `flag` text DEFAULT '', `region` text DEFAULT '', `muslim_population` text DEFAULT '', `total_population` text DEFAULT '', `market_size_usd` text DEFAULT '', `mandate_status` text DEFAULT '', `mandatory_since` text DEFAULT '', `certifying_bodies` text DEFAULT '[]', `import_requirements` text DEFAULT '[]', `standard_basis` text DEFAULT '', `certificate_validity` text DEFAULT '', `estimated_cost_usd` text DEFAULT '', `processing_time` text DEFAULT '', `key_insights` text DEFAULT '[]', `opportunities` text DEFAULT '[]', `challenges` text DEFAULT '[]', `summary` text DEFAULT '', `meta_title` text DEFAULT '', `meta_description` text DEFAULT '', `keywords` text DEFAULT '', `status` text DEFAULT 'active', `created_at` integer NOT NULL, `updated_at` integer NOT NULL
);
CREATE TABLE IF NOT EXISTS `trade_shows` (
	`id` text PRIMARY KEY NOT NULL, `name` text NOT NULL, `city` text DEFAULT '', `country` text DEFAULT '', `region` text DEFAULT '', `start_date` text DEFAULT '', `end_date` text DEFAULT '', `venue` text DEFAULT '', `website` text DEFAULT '', `scale` text DEFAULT '', `description` text DEFAULT '', `focus` text DEFAULT '[]', `exhibitors` integer, `visitors` integer, `meta_title` text DEFAULT '', `meta_description` text DEFAULT '', `keywords` text DEFAULT '', `status` text DEFAULT 'active', `created_at` integer NOT NULL, `updated_at` integer NOT NULL
);
CREATE TABLE IF NOT EXISTS `user` (
	`id` text PRIMARY KEY NOT NULL, `name` text NOT NULL, `email` text NOT NULL, `email_verified` integer NOT NULL, `image` text, `created_at` integer NOT NULL, `updated_at` integer NOT NULL
);
CREATE TABLE IF NOT EXISTS `session` (
	`id` text PRIMARY KEY NOT NULL, `token` text NOT NULL, `user_id` text NOT NULL, `expires_at` integer NOT NULL, `ip_address` text, `user_agent` text, `created_at` integer NOT NULL, `updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE IF NOT EXISTS `account` (
	`id` text PRIMARY KEY NOT NULL, `user_id` text NOT NULL, `account_id` text NOT NULL, `provider_id` text NOT NULL, `access_token` text, `refresh_token` text, `access_token_expires_at` integer, `refresh_token_expires_at` integer, `scope` text, `id_token` text, `created_at` integer NOT NULL, `updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE IF NOT EXISTS `verification` (
	`id` text PRIMARY KEY NOT NULL, `identifier` text NOT NULL, `value` text NOT NULL, `expires_at` integer NOT NULL, `created_at` integer NOT NULL, `updated_at` integer NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS `user_email_unique` ON `user` (`email`);
CREATE UNIQUE INDEX IF NOT EXISTS `session_token_unique` ON `session` (`token`);
CREATE INDEX IF NOT EXISTS `session_user_id_idx` ON `session` (`user_id`);
CREATE INDEX IF NOT EXISTS `account_user_id_idx` ON `account` (`user_id`);
CREATE INDEX IF NOT EXISTS `verification_identifier_idx` ON `verification` (`identifier`);
CREATE UNIQUE INDEX IF NOT EXISTS `media_key_unique` ON `media` (`key`);
CREATE INDEX IF NOT EXISTS `idx_media_key` ON `media` (`key`);
CREATE INDEX IF NOT EXISTS `idx_products_category` ON `products` (`category_slug`);
CREATE INDEX IF NOT EXISTS `idx_products_supplier` ON `products` (`supplier_slug`);
CREATE INDEX IF NOT EXISTS `idx_products_status` ON `products` (`status`);
CREATE INDEX IF NOT EXISTS `idx_products_cert` ON `products` (`cert_status`);
CREATE INDEX IF NOT EXISTS `idx_products_created` ON `products` (`created_at`);
CREATE INDEX IF NOT EXISTS `idx_products_name` ON `products` (`name`);
CREATE INDEX IF NOT EXISTS `idx_suppliers_status` ON `suppliers` (`status`);
CREATE INDEX IF NOT EXISTS `idx_suppliers_country` ON `suppliers` (`country`);
CREATE INDEX IF NOT EXISTS `idx_suppliers_name` ON `suppliers` (`name`);
CREATE INDEX IF NOT EXISTS `idx_pages_type` ON `pages` (`type`);
CREATE INDEX IF NOT EXISTS `idx_pages_status` ON `pages` (`status`);
CREATE INDEX IF NOT EXISTS `idx_pages_category` ON `pages` (`category`);
CREATE INDEX IF NOT EXISTS `idx_pages_published` ON `pages` (`published_at`);
CREATE INDEX IF NOT EXISTS `idx_kb_section` ON `knowledge_base` (`section`);
CREATE INDEX IF NOT EXISTS `idx_kb_status` ON `knowledge_base` (`status`);
CREATE INDEX IF NOT EXISTS `idx_sp_type` ON `service_providers` (`type`);
CREATE INDEX IF NOT EXISTS `idx_sp_status` ON `service_providers` (`status`);
CREATE INDEX IF NOT EXISTS `idx_inquiries_status` ON `inquiries` (`status`);
CREATE INDEX IF NOT EXISTS `idx_inquiries_buyer` ON `inquiries` (`buyer_slug`);
CREATE INDEX IF NOT EXISTS `idx_inquiries_supplier` ON `inquiries` (`supplier_slug`);
CREATE INDEX IF NOT EXISTS `idx_mg_country` ON `market_guides` (`country`);
CREATE INDEX IF NOT EXISTS `idx_mg_status` ON `market_guides` (`status`);
CREATE INDEX IF NOT EXISTS `idx_ts_status` ON `trade_shows` (`status`);
CREATE INDEX IF NOT EXISTS `idx_ts_start` ON `trade_shows` (`start_date`);
CREATE INDEX IF NOT EXISTS `idx_cb_country` ON `certifying_bodies` (`country`);
CREATE INDEX IF NOT EXISTS `idx_cb_status` ON `certifying_bodies` (`status`);
CREATE INDEX IF NOT EXISTS `idx_sp_country` ON `service_providers` (`country`);
CREATE INDEX IF NOT EXISTS `idx_media_alt` ON `media` (`alt`);

CREATE TABLE IF NOT EXISTS `market_guides` (`slug` text PRIMARY KEY NOT NULL, `country` text NOT NULL, `flag` text DEFAULT '', `region` text DEFAULT '', `muslim_population` text DEFAULT '', `total_population` text DEFAULT '', `market_size_usd` text DEFAULT '', `mandate_status` text DEFAULT '', `mandatory_since` text DEFAULT '', `certifying_bodies` text DEFAULT '[]', `import_requirements` text DEFAULT '[]', `standard_basis` text DEFAULT '', `certificate_validity` text DEFAULT '', `estimated_cost_usd` text DEFAULT '', `processing_time` text DEFAULT '', `key_insights` text DEFAULT '[]', `opportunities` text DEFAULT '[]', `challenges` text DEFAULT '[]', `summary` text DEFAULT '', `meta_title` text DEFAULT '', `meta_description` text DEFAULT '', `keywords` text DEFAULT '', `status` text DEFAULT 'active', `created_at` integer NOT NULL, `updated_at` integer NOT NULL);
CREATE TABLE IF NOT EXISTS `trade_shows` (`id` text PRIMARY KEY NOT NULL, `name` text NOT NULL, `city` text DEFAULT '', `country` text DEFAULT '', `region` text DEFAULT '', `start_date` text DEFAULT '', `end_date` text DEFAULT '', `venue` text DEFAULT '', `website` text DEFAULT '', `scale` text DEFAULT '', `description` text DEFAULT '', `focus` text DEFAULT '[]', `exhibitors` integer, `visitors` integer, `meta_title` text DEFAULT '', `meta_description` text DEFAULT '', `keywords` text DEFAULT '', `status` text DEFAULT 'active', `created_at` integer NOT NULL, `updated_at` integer NOT NULL);
CREATE INDEX IF NOT EXISTS "idx_mg_country" ON `market_guides` ("country");
CREATE INDEX IF NOT EXISTS "idx_mg_status" ON `market_guides` ("status");
CREATE INDEX IF NOT EXISTS "idx_ts_country" ON `trade_shows` ("country");
CREATE INDEX IF NOT EXISTS "idx_ts_status" ON `trade_shows` ("status");
CREATE INDEX IF NOT EXISTS "idx_ts_start_date" ON `trade_shows` ("start_date");
