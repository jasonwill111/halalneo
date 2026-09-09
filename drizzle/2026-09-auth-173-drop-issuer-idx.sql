-- better-auth 1.7.3: issuer column removed from the generated schema.
-- SQLite can't drop a column with a UNIQUE index; 1.7.3 never reads or
-- writes `issuer`, so dropping the index (and leaving the nullable
-- legacy column in place) restores compatibility.
DROP INDEX IF EXISTS `account_issuer_accountId_uidx`;
