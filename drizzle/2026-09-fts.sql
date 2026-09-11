-- FTS5 full-text indexes for the two unbounded tables.
-- Replaces LIKE '%term%' substring scans (full-table) on products/suppliers
-- search paths with indexed MATCH queries. Small tables (<500 rows) keep LIKE.
-- Standalone FTS tables (content='') + triggers; backfilled below.

CREATE VIRTUAL TABLE IF NOT EXISTS products_fts USING fts5(
  name, short_description, description, slug UNINDEXED
);

CREATE TRIGGER IF NOT EXISTS products_fts_ai AFTER INSERT ON products BEGIN
  INSERT INTO products_fts(rowid, name, short_description, description, slug)
  VALUES (new.rowid, new.name, new.short_description, new.description, new.slug);
END;

CREATE TRIGGER IF NOT EXISTS products_fts_ad AFTER DELETE ON products BEGIN
  DELETE FROM products_fts WHERE rowid = old.rowid;
END;

CREATE TRIGGER IF NOT EXISTS products_fts_au AFTER UPDATE ON products BEGIN
  DELETE FROM products_fts WHERE rowid = old.rowid;
  INSERT INTO products_fts(rowid, name, short_description, description, slug)
  VALUES (new.rowid, new.name, new.short_description, new.description, new.slug);
END;

CREATE VIRTUAL TABLE IF NOT EXISTS suppliers_fts USING fts5(
  name, description, country, certifications, slug UNINDEXED
);

CREATE TRIGGER IF NOT EXISTS suppliers_fts_ai AFTER INSERT ON suppliers BEGIN
  INSERT INTO suppliers_fts(rowid, name, description, country, certifications, slug)
  VALUES (new.rowid, new.name, new.description, new.country, new.certifications, new.slug);
END;

CREATE TRIGGER IF NOT EXISTS suppliers_fts_ad AFTER DELETE ON suppliers BEGIN
  DELETE FROM suppliers_fts WHERE rowid = old.rowid;
END;

CREATE TRIGGER IF NOT EXISTS suppliers_fts_au AFTER UPDATE ON suppliers BEGIN
  DELETE FROM suppliers_fts WHERE rowid = old.rowid;
  INSERT INTO suppliers_fts(rowid, name, description, country, certifications, slug)
  VALUES (new.rowid, new.name, new.description, new.country, new.certifications, new.slug);
END;

-- Backfill existing rows
INSERT INTO products_fts(rowid, name, short_description, description, slug)
SELECT rowid, name, short_description, description, slug FROM products;
INSERT INTO suppliers_fts(rowid, name, description, country, certifications, slug)
SELECT rowid, name, description, country, certifications, slug FROM suppliers;
