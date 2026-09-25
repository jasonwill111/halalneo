CREATE TABLE IF NOT EXISTS buyers (
  user_id TEXT PRIMARY KEY,
  company_name TEXT,
  phone TEXT,
  country TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_buyers_user ON buyers(user_id);
ALTER TABLE suppliers ADD COLUMN owner_user_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_suppliers_owner_user ON suppliers(owner_user_id);

ALTER TABLE knowledge_base ADD COLUMN content_blocks TEXT DEFAULT '[]';
ALTER TABLE pages ADD COLUMN content_blocks TEXT DEFAULT '[]';
ALTER TABLE market_guides ADD COLUMN content_blocks TEXT DEFAULT '[]';
ALTER TABLE trade_shows ADD COLUMN content_blocks TEXT DEFAULT '[]';
ALTER TABLE success_stories ADD COLUMN content_blocks TEXT DEFAULT '[]';
ALTER TABLE knowledge_base ADD COLUMN published_at INTEGER;
ALTER TABLE market_guides ADD COLUMN published_at INTEGER;
ALTER TABLE trade_shows ADD COLUMN published_at INTEGER;
ALTER TABLE success_stories ADD COLUMN published_at INTEGER;
