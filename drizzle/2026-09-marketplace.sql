-- Marketplace wave: buying requests, promotions, follows, supplier updates,
-- page views (analytics), success stories, supplier membership links.

CREATE TABLE IF NOT EXISTS buying_requests (
  id TEXT PRIMARY KEY,
  buyer_id TEXT,
  buyer_email TEXT,
  buyer_country TEXT DEFAULT '',
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category_slug TEXT,
  quantity TEXT DEFAULT '',
  target_price TEXT DEFAULT '',
  destination TEXT DEFAULT '',
  status TEXT DEFAULT 'active',
  views INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rfq_status ON buying_requests(status);
CREATE INDEX IF NOT EXISTS idx_rfq_buyer ON buying_requests(buyer_id);
CREATE INDEX IF NOT EXISTS idx_rfq_category ON buying_requests(category_slug);

CREATE TABLE IF NOT EXISTS promotions (
  id TEXT PRIMARY KEY,
  supplier_slug TEXT NOT NULL,
  product_slug TEXT,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  discount_pct INTEGER,
  price_min TEXT,
  price_max TEXT,
  price_unit TEXT,
  moq TEXT,
  valid_until TEXT,
  status TEXT DEFAULT 'active',
  views INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_promo_status ON promotions(status);
CREATE INDEX IF NOT EXISTS idx_promo_supplier ON promotions(supplier_slug);

CREATE TABLE IF NOT EXISTS supplier_members (
  user_id TEXT NOT NULL,
  supplier_slug TEXT NOT NULL,
  role TEXT DEFAULT 'owner',
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, supplier_slug)
);
CREATE INDEX IF NOT EXISTS idx_members_user ON supplier_members(user_id);

CREATE TABLE IF NOT EXISTS follows (
  user_id TEXT NOT NULL,
  supplier_slug TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, supplier_slug)
);
CREATE INDEX IF NOT EXISTS idx_follows_user ON follows(user_id);

CREATE TABLE IF NOT EXISTS supplier_updates (
  id TEXT PRIMARY KEY,
  supplier_slug TEXT NOT NULL,
  body TEXT NOT NULL,
  image TEXT,
  status TEXT DEFAULT 'active',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_updates_supplier ON supplier_updates(supplier_slug);

CREATE TABLE IF NOT EXISTS page_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_views_slug ON page_views(kind, slug);
CREATE INDEX IF NOT EXISTS idx_views_time ON page_views(created_at);

CREATE TABLE IF NOT EXISTS success_stories (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT DEFAULT '',
  body TEXT DEFAULT '',
  supplier_slug TEXT,
  buyer_country TEXT DEFAULT '',
  deal_value TEXT DEFAULT '',
  image TEXT,
  status TEXT DEFAULT 'draft',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_stories_status ON success_stories(status);
CREATE INDEX IF NOT EXISTS idx_stories_supplier ON success_stories(supplier_slug);
