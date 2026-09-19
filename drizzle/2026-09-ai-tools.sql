-- AI tool catalogue (ai_tools).
--
-- The admin AI-tools page used to write to the localStorage demo store only;
-- it now persists through /api/ai-tools, which needs a real table.
-- Hand-applied like the other 2026-09 migrations, e.g.
--   wrangler d1 execute halalneo-db --local  --file=drizzle/2026-09-ai-tools.sql
--   wrangler d1 execute halalneo-db --remote --file=drizzle/2026-09-ai-tools.sql
--
-- Idempotent: safe to re-run.

CREATE TABLE IF NOT EXISTS `ai_tools` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `slug` TEXT NOT NULL UNIQUE,
  `name` TEXT NOT NULL,
  `description` TEXT DEFAULT '',
  `long_description` TEXT DEFAULT '',
  `features` TEXT DEFAULT '[]',
  `category` TEXT DEFAULT 'assistant',
  `status` TEXT DEFAULT 'disabled',
  `created_at` INTEGER NOT NULL,
  `updated_at` INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS `idx_ai_tools_status` ON `ai_tools` (`status`);
CREATE INDEX IF NOT EXISTS `idx_ai_tools_category` ON `ai_tools` (`category`);

-- Backfill with the curated catalogue from src/lib/data/ai-tools.ts so the
-- migrated admin screen starts from the same four tools the demo store had.
INSERT OR IGNORE INTO `ai_tools`
  (`id`,`slug`,`name`,`description`,`long_description`,`features`,`category`,`status`,`created_at`,`updated_at`)
VALUES
  ('certification-checker','certification-checker','Certification Checker',
   'Reads a certificate document and summarises scope, status, body and expiry into a ledger row.',
   'Upload or paste a halal certificate document and get a structured verification summary —issuing body, standard, scope, status and expiry —in seconds. Built for buyers who need to check a supplier''s claims before committing to a shipment.',
   '["Extracts certificate number, issuing body and standard","Flags expired, pending and unrecognised certificates","Exports a verification summary you can attach to an order"]',
   'compliance','active', CAST(strftime('%s','now') AS INTEGER), CAST(strftime('%s','now') AS INTEGER)),
  ('supplier-match','supplier-match','Supplier Match',
   'Maps a buyer''s product requirements to certified suppliers ranked by scope fit.',
   'Describe the products and certification you need and Supplier Match ranks verified suppliers by how well their certified scope covers your requirement —country, standard and business type included.',
   '["Matches against certified scope, not just category","Ranking by certification fit and country of origin","Shortlists ready for your sourcing workflow"]',
   'sourcing','active', CAST(strftime('%s','now') AS INTEGER), CAST(strftime('%s','now') AS INTEGER)),
  ('halal-assistant','halal-assistant','Halal Trade Assistant',
   'Answers sourcing and compliance questions from the knowledge base.',
   'Ask sourcing and compliance questions and get answers grounded in the HalalNeo knowledge base —certification recognition, import rules, logistics and market guides.',
   '["Answers grounded in the knowledge base","Covers certification, import and logistics questions","Cites the articles it draws from"]',
   'assistant','disabled', CAST(strftime('%s','now') AS INTEGER), CAST(strftime('%s','now') AS INTEGER)),
  ('market-report','market-report','Market Report Generator',
   'Drafts country market guides and regulatory summaries for editorial review.',
   'Generates a first draft of a country market guide or regulatory summary from the research library, ready for editorial review before publication.',
   '["Drafts country market guides from research","Summarises regulatory and recognition requirements","Output ready for editorial review"]',
   'documentation','disabled', CAST(strftime('%s','now') AS INTEGER), CAST(strftime('%s','now') AS INTEGER));
