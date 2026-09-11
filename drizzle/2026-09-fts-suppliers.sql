-- Recreate suppliers_fts WITH the certifications column (prior version lacked it).
DROP TRIGGER IF EXISTS suppliers_fts_ai;
DROP TRIGGER IF EXISTS suppliers_fts_ad;
DROP TRIGGER IF EXISTS suppliers_fts_au;
DROP TABLE IF EXISTS suppliers_fts;

CREATE VIRTUAL TABLE suppliers_fts USING fts5(
  name, description, country, certifications, slug UNINDEXED
);

CREATE TRIGGER suppliers_fts_ai AFTER INSERT ON suppliers BEGIN
  INSERT INTO suppliers_fts(rowid, name, description, country, certifications, slug)
  VALUES (new.rowid, new.name, new.description, new.country, new.certifications, new.slug);
END;

CREATE TRIGGER suppliers_fts_ad AFTER DELETE ON suppliers BEGIN
  DELETE FROM suppliers_fts WHERE rowid = old.rowid;
END;

CREATE TRIGGER suppliers_fts_au AFTER UPDATE ON suppliers BEGIN
  DELETE FROM suppliers_fts WHERE rowid = old.rowid;
  INSERT INTO suppliers_fts(rowid, name, description, country, certifications, slug)
  VALUES (new.rowid, new.name, new.description, new.country, new.certifications, new.slug);
END;

INSERT INTO suppliers_fts(rowid, name, description, country, certifications, slug)
SELECT rowid, name, description, country, certifications, slug FROM suppliers;
