-- Link inquiries to the signed-in buyer so Account → Inquiries shows real data.
-- NULL for anonymous/legacy rows. Applied locally via `pnpm db:apply` and to
-- remote via `wrangler d1 execute halalneo-db --remote --file` (2026-09-19).
ALTER TABLE inquiries ADD COLUMN user_id TEXT;

CREATE INDEX IF NOT EXISTS idx_inquiries_user ON inquiries(user_id);
