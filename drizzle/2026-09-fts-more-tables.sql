-- FTS5 full-text indexes for remaining searchable tables.
-- knowledge_base, pages (blog), certifying_bodies, service_providers.
-- Pattern: standalone FTS5 tables + INSERT/UPDATE/DELETE triggers + backfill.
-- Small tables (<500 rows) can keep LIKE per project discipline, but FTS
-- scales without cost and eliminates full-table scans on growth.

-- ==================== knowledge_base ====================
CREATE VIRTUAL TABLE IF NOT EXISTS knowledge_base_fts USING fts5(
  slug UNINDEXED, title, summary, body, tags
);

CREATE TRIGGER IF NOT EXISTS kb_fts_ai AFTER INSERT ON knowledge_base BEGIN
  INSERT INTO knowledge_base_fts(rowid, slug, title, summary, body, tags)
  VALUES (new.rowid, new.slug, new.title, new.summary, new.body, new.tags);
END;

CREATE TRIGGER IF NOT EXISTS kb_fts_ad AFTER DELETE ON knowledge_base BEGIN
  DELETE FROM knowledge_base_fts WHERE rowid = old.rowid;
END;

CREATE TRIGGER IF NOT EXISTS kb_fts_au AFTER UPDATE ON knowledge_base BEGIN
  DELETE FROM knowledge_base_fts WHERE rowid = old.rowid;
  INSERT INTO knowledge_base_fts(rowid, slug, title, summary, body, tags)
  VALUES (new.rowid, new.slug, new.title, new.summary, new.body, new.tags);
END;

INSERT OR IGNORE INTO knowledge_base_fts(rowid, slug, title, summary, body, tags)
SELECT rowid, slug, title, summary, body, tags FROM knowledge_base;

-- ==================== pages (blog) ====================
CREATE VIRTUAL TABLE IF NOT EXISTS pages_fts USING fts5(
  slug UNINDEXED, title, excerpt, body, category, tags
);

CREATE TRIGGER IF NOT EXISTS pages_fts_ai AFTER INSERT ON pages BEGIN
  INSERT INTO pages_fts(rowid, slug, title, excerpt, body, category, tags)
  VALUES (new.rowid, new.slug, new.title, new.excerpt, new.body, new.category, new.tags);
END;

CREATE TRIGGER IF NOT EXISTS pages_fts_ad AFTER DELETE ON pages BEGIN
  DELETE FROM pages_fts WHERE rowid = old.rowid;
END;

CREATE TRIGGER IF NOT EXISTS pages_fts_au AFTER UPDATE ON pages BEGIN
  DELETE FROM pages_fts WHERE rowid = old.rowid;
  INSERT INTO pages_fts(rowid, slug, title, excerpt, body, category, tags)
  VALUES (new.rowid, new.slug, new.title, new.excerpt, new.body, new.category, new.tags);
END;

INSERT OR IGNORE INTO pages_fts(rowid, slug, title, excerpt, body, category, tags)
SELECT rowid, slug, title, excerpt, body, category, tags FROM pages;

-- ==================== certifying_bodies ====================
CREATE VIRTUAL TABLE IF NOT EXISTS certifying_bodies_fts USING fts5(
  id UNINDEXED, name, country, standard, description
);

CREATE TRIGGER IF NOT EXISTS cb_fts_ai AFTER INSERT ON certifying_bodies BEGIN
  INSERT INTO certifying_bodies_fts(rowid, id, name, country, standard, description)
  VALUES (new.rowid, new.id, new.name, new.country, new.standard, new.description);
END;

CREATE TRIGGER IF NOT EXISTS cb_fts_ad AFTER DELETE ON certifying_bodies BEGIN
  DELETE FROM certifying_bodies_fts WHERE rowid = old.rowid;
END;

CREATE TRIGGER IF NOT EXISTS cb_fts_au AFTER UPDATE ON certifying_bodies BEGIN
  DELETE FROM certifying_bodies_fts WHERE rowid = old.rowid;
  INSERT INTO certifying_bodies_fts(rowid, id, name, country, standard, description)
  VALUES (new.rowid, new.id, new.name, new.country, new.standard, new.description);
END;

INSERT OR IGNORE INTO certifying_bodies_fts(rowid, id, name, country, standard, description)
SELECT rowid, id, name, country, standard, description FROM certifying_bodies;

-- ==================== service_providers ====================
CREATE VIRTUAL TABLE IF NOT EXISTS service_providers_fts USING fts5(
  slug UNINDEXED, name, country, description
);

CREATE TRIGGER IF NOT EXISTS sp_fts_ai AFTER INSERT ON service_providers BEGIN
  INSERT INTO service_providers_fts(rowid, slug, name, country, description)
  VALUES (new.rowid, new.slug, new.name, new.country, new.description);
END;

CREATE TRIGGER IF NOT EXISTS sp_fts_ad AFTER DELETE ON service_providers BEGIN
  DELETE FROM service_providers_fts WHERE rowid = old.rowid;
END;

CREATE TRIGGER IF NOT EXISTS sp_fts_au AFTER UPDATE ON service_providers BEGIN
  DELETE FROM service_providers_fts WHERE rowid = old.rowid;
  INSERT INTO service_providers_fts(rowid, slug, name, country, description)
  VALUES (new.rowid, new.slug, new.name, new.country, new.description);
END;

INSERT OR IGNORE INTO service_providers_fts(rowid, slug, name, country, description)
SELECT rowid, slug, name, country, description FROM service_providers;
