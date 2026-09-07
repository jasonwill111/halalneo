-- Supplier applications feature: sync remote D1 schema with runtime_schema.sql
-- Adds SEO/meta columns that exist in schema.ts but were missing on remote.
-- NULL-safe defaults (nullable) so existing rows stay valid; queries use
-- these columns only via optional fields.

ALTER TABLE `suppliers` ADD COLUMN `meta_title` text DEFAULT '';
ALTER TABLE `suppliers` ADD COLUMN `meta_description` text DEFAULT '';
ALTER TABLE `suppliers` ADD COLUMN `keywords` text DEFAULT '';

ALTER TABLE `products` ADD COLUMN `meta_title` text DEFAULT '';
ALTER TABLE `products` ADD COLUMN `meta_description` text DEFAULT '';
ALTER TABLE `products` ADD COLUMN `keywords` text DEFAULT '';

ALTER TABLE `categories` ADD COLUMN `meta_title` text DEFAULT '';
ALTER TABLE `categories` ADD COLUMN `meta_description` text DEFAULT '';
ALTER TABLE `categories` ADD COLUMN `keywords` text DEFAULT '';

ALTER TABLE `certifying_bodies` ADD COLUMN `meta_title` text DEFAULT '';
ALTER TABLE `certifying_bodies` ADD COLUMN `meta_description` text DEFAULT '';
ALTER TABLE `certifying_bodies` ADD COLUMN `keywords` text DEFAULT '';

ALTER TABLE `knowledge_base` ADD COLUMN `meta_title` text DEFAULT '';
ALTER TABLE `knowledge_base` ADD COLUMN `meta_description` text DEFAULT '';
ALTER TABLE `knowledge_base` ADD COLUMN `keywords` text DEFAULT '';

ALTER TABLE `service_providers` ADD COLUMN `meta_title` text DEFAULT '';
ALTER TABLE `service_providers` ADD COLUMN `meta_description` text DEFAULT '';
ALTER TABLE `service_providers` ADD COLUMN `keywords` text DEFAULT '';
