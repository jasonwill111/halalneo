-- better-auth 1.7.3 schema-diff guard: the `account.issuer` column is NOT NULL
-- with no default in our earlier migration, but 1.7.3 never writes it, so every
-- account insert would fail. 1.7.3's generated schema has no issuer at all
-- (providerId/accountId replace it). The old unique index was already dropped;
-- D1 (SQLite 3.40+) supports DROP COLUMN directly.
ALTER TABLE `account` DROP COLUMN `issuer`;
