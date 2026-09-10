-- Backfill drift: drizzle schema declares categories.status but D1 lacked the column.
-- ADD COLUMN with a non-null DEFAULT backfills existing rows automatically.
ALTER TABLE categories ADD COLUMN status TEXT DEFAULT 'active';
UPDATE categories SET status = 'active' WHERE status IS NULL;
