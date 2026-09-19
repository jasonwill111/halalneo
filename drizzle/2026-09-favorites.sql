-- Favorites: buyers save products (replaces localStorage favorites).
CREATE TABLE IF NOT EXISTS favorites (
  user_id TEXT NOT NULL,
  product_slug TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, product_slug)
);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
