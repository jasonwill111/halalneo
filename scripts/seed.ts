import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../src/lib/server/db/schema';

const DB_PATH = './local.db';

// ── Import seed data ──────────────────────────────────────────────────
import { suppliers } from '../src/lib/data/suppliers';
import { products } from '../src/lib/data/products';
import { categories } from '../src/lib/data/categories';
import { certifyingBodies } from '../src/lib/data/certifying-bodies';
import { kbArticles } from '../src/lib/data/kb-articles';
import { blogPosts } from '../src/lib/data/blog';
import { glossaryTerms } from '../src/lib/data/glossary';
import { serviceProviders } from '../src/lib/data/service-providers';
import { marketGuides } from '../src/lib/data/market-guides';
import { tradeShows } from '../src/lib/data/trade-shows';

// ── Helpers ───────────────────────────────────────────────────────────
function now(): Date {
	return new Date();
}

function log(emoji: string, msg: string) {
	console.log(`${emoji}  ${msg}`);
}

// ── Main ──────────────────────────────────────────────────────────────
async function main() {
	log('🗄️', `Opening database at ${DB_PATH}`);
	const sqlite = new Database(DB_PATH);
	const db = drizzle(sqlite, { schema });

	log('🗑️', 'Clearing existing data (respecting foreign keys)');
	// Delete in reverse dependency order
	sqlite.exec('DELETE FROM inquiries');
	sqlite.exec('DELETE FROM products');
	sqlite.exec('DELETE FROM suppliers');
	sqlite.exec('DELETE FROM pages');
	sqlite.exec('DELETE FROM knowledge_base');
	sqlite.exec('DELETE FROM service_providers');
	sqlite.exec('DELETE FROM certifying_bodies');
	sqlite.exec('DELETE FROM categories');
	sqlite.exec('DELETE FROM media');
	sqlite.exec('DELETE FROM site_settings');
	sqlite.exec('DELETE FROM market_guides');
	sqlite.exec('DELETE FROM trade_shows');

	// ── Categories ───────────────────────────────────────────────────
	log('📂', `Seeding ${categories.length} categories`);
	await db.insert(schema.categories).values(
		categories.map((c) => ({
			slug: c.slug,
			name: c.name,
			description: c.description,
			parentSlug: c.parentSlug ?? null,
			icon: c.icon,
			sortOrder: 0,
			createdAt: now(),
			updatedAt: now()
		}))
	);
	log('✅', `  → ${categories.length} categories inserted`);

	// ── Certifying Bodies ────────────────────────────────────────────
	log('📋', `Seeding ${certifyingBodies.length} certifying bodies`);
	await db.insert(schema.certifyingBodies).values(
		certifyingBodies.map((cb) => ({
			id: cb.id,
			name: cb.name,
			country: cb.country,
			standard: cb.standard ?? null,
			website: null,
			description: null,
			status: 'active' as const,
			createdAt: now(),
			updatedAt: now()
		}))
	);
	log('✅', `  → ${certifyingBodies.length} certifying bodies inserted`);

	// ── Suppliers ────────────────────────────────────────────────────
	log('🏭', `Seeding ${suppliers.length} suppliers`);
	await db.insert(schema.suppliers).values(
		suppliers.map((s) => ({
			slug: s.slug,
			name: s.name,
			country: s.country,
			businessType: s.businessType,
			isBrand: s.isBrand,
			status: s.status,
			logoInitials: s.logoInitials,
			description: s.description,
			coverImage: s.coverImage ?? null,
			website: s.website ?? null,
			email: s.email ?? null,
			phone: s.phone ?? null,
			whatsapp: s.whatsapp ?? null,
			line: s.line ?? null,
			yearEstablished: s.yearEstablished,
			employeeCount: s.employeeCount ?? null,
			productionCapacity: s.productionCapacity ?? null,
			mainMarkets: s.mainMarkets ? JSON.stringify(s.mainMarkets) : null,
			certifications: JSON.stringify(s.certifications),
			createdAt: now(),
			updatedAt: now()
		}))
	);
	log('✅', `  → ${suppliers.length} suppliers inserted`);

	// ── Products ─────────────────────────────────────────────────────
	log('📦', `Seeding ${products.length} products`);
	await db.insert(schema.products).values(
		products.map((p) => ({
			slug: p.slug,
			supplierSlug: p.supplierSlug,
			categorySlug: p.categorySlug,
			name: p.name,
			shortDescription: p.shortDescription,
			description: p.description ?? null,
			image: p.image,
			images: p.images ? JSON.stringify(p.images) : null,
			videos: p.videos ? JSON.stringify(p.videos) : null,
			moq: p.moq,
			priceMin: p.priceMin ?? null,
			priceMax: p.priceMax ?? null,
			priceUnit: p.priceUnit ?? null,
			certStatus: p.certStatus,
			units: p.units,
			originCountry: p.originCountry,
			features: JSON.stringify(p.features),
			specifications: p.specifications ? JSON.stringify(p.specifications) : null,
			faqs: p.faqs ? JSON.stringify(p.faqs) : null,
			resources: p.resources ? JSON.stringify(p.resources) : null,
			status: p.status ?? 'active',
			views: p.views ?? 0,
			createdAt: now(),
			updatedAt: now()
		}))
	);
	log('✅', `  → ${products.length} products inserted`);

	// ── Knowledge Base Articles → knowledgeBase ──────────────────────
	log('📚', `Seeding ${kbArticles.length} knowledge base articles`);
	await db.insert(schema.knowledgeBase).values(
		kbArticles.map((a) => ({
			slug: a.slug,
			section: a.section,
			title: a.title,
			summary: a.summary,
			body: a.body,
			tags: JSON.stringify(a.tags),
			author: a.author ?? null,
			status: a.status ?? 'published',
			views: a.views ?? 0,
			createdAt: now(),
			updatedAt: now()
		}))
	);
	log('✅', `  → ${kbArticles.length} knowledge base articles inserted`);

	// ── Blog Posts → pages ───────────────────────────────────────────
	log('📝', `Seeding ${blogPosts.length} blog posts as pages`);
	await db.insert(schema.pages).values(
		blogPosts.map((p) => ({
			slug: p.slug,
			title: p.title,
			type: 'blog' as const,
			excerpt: p.excerpt ?? null,
			body: p.body,
			author: p.author ?? null,
			category: 'blog',
			featuredImage: p.featuredImage ?? null,
			tags: p.tags ? JSON.stringify(p.tags) : null,
			metaTitle: null,
			metaDescription: null,
			keywords: null,
			status: p.status ?? 'draft',
			views: 0,
			publishedAt: p.date ? new Date(p.date) : null,
			createdAt: now(),
			updatedAt: now()
		}))
	);
	log('✅', `  → ${blogPosts.length} blog posts inserted`);

	// ── Glossary Terms → pages ───────────────────────────────────────
	log('📖', `Seeding ${glossaryTerms.length} glossary terms as pages`);
	await db.insert(schema.pages).values(
		glossaryTerms.map((t) => ({
			slug: `glossary-${t.term.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
			title: t.term,
			type: 'landing' as const,
			excerpt: t.definition,
			body: t.definition,
			author: null,
			category: 'glossary',
			featuredImage: null,
			tags: null,
			metaTitle: t.term,
			metaDescription: t.definition,
			keywords: null,
			status: 'published' as const,
			views: 0,
			publishedAt: null,
			createdAt: now(),
			updatedAt: now()
		}))
	);
	log('✅', `  → ${glossaryTerms.length} glossary terms inserted`);

	// ── Service Providers ────────────────────────────────────────────
	log('🤝', `Seeding ${serviceProviders.length} service providers`);
	await db.insert(schema.serviceProviders).values(
		serviceProviders.map((sp) => ({
			slug: sp.slug,
			name: sp.name,
			type: sp.type,
			country: sp.country,
			description: sp.description ?? null,
			website: sp.website ?? null,
			email: sp.email ?? null,
			phone: sp.phone ?? null,
			whatsapp: sp.whatsapp ?? null,
			line: sp.line ?? null,
			rating: sp.rating ?? null,
			status: sp.status,
			createdAt: now(),
			updatedAt: now()
		}))
	);
	log('✅', `  → ${serviceProviders.length} service providers inserted`);

	// ── Market Guides ───────────────────────────────────────────────
	log('🌍', `Seeding ${marketGuides.length} market guides`);
	await db.insert(schema.marketGuides).values(
		marketGuides.map((g) => ({
			slug: g.slug,
			country: g.country,
			flag: g.flag,
			region: g.region,
			muslimPopulation: g.muslimPopulation,
			totalPopulation: g.totalPopulation,
			marketSizeUsd: g.marketSizeUsd,
			mandateStatus: g.mandateStatus,
			mandatorySince: g.mandatorySince ?? null,
			certifyingBodies: JSON.stringify(g.certifyingBodies),
			importRequirements: JSON.stringify(g.importRequirements),
			standardBasis: g.standardBasis,
			certificateValidity: g.certificateValidity,
			estimatedCostUsd: g.estimatedCostUsd,
			processingTime: g.processingTime,
			keyInsights: JSON.stringify(g.keyInsights),
			opportunities: JSON.stringify(g.opportunities),
			challenges: JSON.stringify(g.challenges),
			summary: g.summary,
			metaTitle: null,
			metaDescription: null,
			keywords: null,
			createdAt: now(),
			updatedAt: now()
		}))
	);
	log('✅', `  → ${marketGuides.length} market guides inserted`);

	// ── Trade Shows ─────────────────────────────────────────────────
	log('🎪', `Seeding ${tradeShows.length} trade shows`);
	await db.insert(schema.tradeShows).values(
		tradeShows.map((t) => ({
			id: t.id,
			name: t.name,
			city: t.city,
			country: t.country,
			region: t.region,
			startDate: t.startDate,
			endDate: t.endDate,
			venue: t.venue,
			website: t.website,
			scale: t.scale,
			description: t.description,
			focus: JSON.stringify(t.focus),
			exhibitors: null,
			visitors: null,
			metaTitle: null,
			metaDescription: null,
			keywords: null,
			status: 'active',
			createdAt: now(),
			updatedAt: now()
		}))
	);
	log('✅', `  → ${tradeShows.length} trade shows inserted`);

	// ── Summary ──────────────────────────────────────────────────────
	const counts = {
		categories: sqlite.prepare('SELECT COUNT(*) as c FROM categories').get().c,
		certifyingBodies: sqlite.prepare('SELECT COUNT(*) as c FROM certifying_bodies').get().c,
		suppliers: sqlite.prepare('SELECT COUNT(*) as c FROM suppliers').get().c,
		products: sqlite.prepare('SELECT COUNT(*) as c FROM products').get().c,
		knowledgeBase: sqlite.prepare('SELECT COUNT(*) as c FROM knowledge_base').get().c,
		pages: sqlite.prepare('SELECT COUNT(*) as c FROM pages').get().c,
		serviceProviders: sqlite.prepare('SELECT COUNT(*) as c FROM service_providers').get().c,
		marketGuides: sqlite.prepare('SELECT COUNT(*) as c FROM market_guides').get().c,
		tradeShows: sqlite.prepare('SELECT COUNT(*) as c FROM trade_shows').get().c
	};

	console.log('\n🎉 Seed complete! Table counts:');
	console.log(JSON.stringify(counts, null, 2));

	sqlite.close();
}

main().catch((err) => {
	console.error('❌ Seed failed:', err);
	process.exit(1);
});
