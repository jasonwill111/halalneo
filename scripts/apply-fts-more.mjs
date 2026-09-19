// Apply the 2026-09-fts-more-tables.sql migration to the LOCAL wrangler D1 sqlite.
// Run BEFORE starting `wrangler dev`. Idempotent (IF NOT EXISTS + INSERT OR IGNORE).
import Database from 'better-sqlite3';
import fs from 'node:fs';

const sqlPath = new URL('../drizzle/2026-09-fts-more-tables.sql', import.meta.url);
const dbPath = process.argv[2];
if (!dbPath) {
	console.error('usage: node scripts/apply-fts-more.mjs <path-to-local-d1.sqlite>');
	process.exit(1);
}

const db = new Database(dbPath);
const sql = fs.readFileSync(sqlPath, 'utf8');

// Split on "END;" (end of trigger blocks) — our SQL has CREATE ... BEGIN ... END
// statements plus plain statements. Simplest robust split: on ';\n' boundaries
// won't work because triggers contain newlines inside BEGIN/END without ';'.
// Strategy: split on lines that are exactly ';' at top level of triggers.
const statements = [];
let cur = '';
for (const line of sql.split('\n')) {
	const trimmed = line.trim();
	if (trimmed === 'END;') {
		cur += line + '\n';
		statements.push(cur.trim());
		cur = '';
		continue;
	}
	if (trimmed === '') {
		continue;
	}
	cur += line + '\n';
}
if (cur.trim()) statements.push(cur.trim());

for (const stmt of statements) {
	const first = stmt.split('\n').map((l) => l.trim()).find(Boolean) ?? '';
	const isInsert = /^INSERT/i.test(first);
	const isTrigger = /^CREATE\s+TRIGGER/i.test(first);
	const isTable = /^CREATE\s+VIRTUAL/i.test(first);
	try {
		db.exec(stmt.replace(/\nEND;\s*$/, '')); // better-sqlite3 wants clean SQL
	} catch {
		// For triggers, better-sqlite3 needs the whole CREATE TRIGGER ... END block.
		// Re-try without stripping; if that fails too, report it.
		try {
			db.exec(stmt);
		} catch (e2) {
			console.error(`FAILED:\n${first.slice(0, 80)}\n  ${e2.message}`);
		}
	}
	if (isInsert || isTrigger || isTable) {
		console.log(`applied: ${first.slice(0, 70)}`);
	}
}

// Report resulting FTS tables + counts
const rows = db
	.prepare(`SELECT type, name FROM sqlite_master WHERE name LIKE '%fts%' ORDER BY name`)
	.all()
	.map((r) => `${r.type === 'table' ? 'T' : r.type === 'trigger' ? 'V' : '?' } ${r.name}`);
console.log('\nFTS objects now in local DB:\n' + rows.join('\n'));

// Backfill sanity: row counts in each new FTS table
for (const t of ['knowledge_base_fts', 'pages_fts', 'certifying_bodies_fts', 'service_providers_fts']) {
	try {
		const c = db.prepare(`SELECT count(*) n FROM ${t}`).get().n;
		console.log(`${t}: ${c} rows`);
	} catch {
		console.log(`${t}: missing`);
	}
}
db.close();
