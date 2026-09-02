CREATE TABLE `categories` (
	`slug` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`parent_slug` text,
	`icon` text,
	`sort_order` integer DEFAULT 0,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `certifying_bodies` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`country` text NOT NULL,
	`standard` text,
	`website` text,
	`description` text,
	`status` text DEFAULT 'active',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`buyer_slug` text NOT NULL,
	`supplier_slug` text,
	`product_slug` text,
	`subject` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'active',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`supplier_slug`) REFERENCES `suppliers`(`slug`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_slug`) REFERENCES `products`(`slug`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `knowledge_base` (
	`slug` text PRIMARY KEY NOT NULL,
	`section` text NOT NULL,
	`title` text NOT NULL,
	`summary` text,
	`body` text,
	`tags` text,
	`author` text,
	`status` text DEFAULT 'draft',
	`views` integer DEFAULT 0,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`filename` text NOT NULL,
	`content_type` text NOT NULL,
	`size` integer NOT NULL,
	`uploaded_by` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `media_key_unique` ON `media` (`key`);--> statement-breakpoint
CREATE TABLE `pages` (
	`slug` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`type` text NOT NULL,
	`excerpt` text,
	`body` text,
	`author` text,
	`category` text,
	`featured_image` text,
	`tags` text,
	`meta_title` text,
	`meta_description` text,
	`keywords` text,
	`status` text DEFAULT 'draft',
	`views` integer DEFAULT 0,
	`published_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `products` (
	`slug` text PRIMARY KEY NOT NULL,
	`supplier_slug` text NOT NULL,
	`category_slug` text NOT NULL,
	`name` text NOT NULL,
	`short_description` text,
	`description` text,
	`image` text,
	`images` text,
	`videos` text,
	`moq` text,
	`price_min` real,
	`price_max` real,
	`price_unit` text,
	`cert_status` text DEFAULT 'pending',
	`units` text,
	`origin_country` text,
	`features` text,
	`specifications` text,
	`faqs` text,
	`resources` text,
	`status` text DEFAULT 'draft',
	`views` integer DEFAULT 0,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`supplier_slug`) REFERENCES `suppliers`(`slug`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_slug`) REFERENCES `categories`(`slug`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `service_providers` (
	`slug` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`country` text NOT NULL,
	`description` text,
	`website` text,
	`email` text,
	`phone` text,
	`whatsapp` text,
	`line` text,
	`rating` real,
	`status` text DEFAULT 'pending',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`slug` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`country` text NOT NULL,
	`business_type` text NOT NULL,
	`is_brand` integer DEFAULT false,
	`status` text DEFAULT 'pending',
	`logo_initials` text,
	`description` text,
	`cover_image` text,
	`website` text,
	`email` text,
	`phone` text,
	`whatsapp` text,
	`line` text,
	`year_established` integer,
	`employee_count` text,
	`production_capacity` text,
	`main_markets` text,
	`certifications` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
