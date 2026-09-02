import { writeFileSync } from 'fs';
import { suppliers } from '../src/lib/data/suppliers';
import { products } from '../src/lib/data/products';
import { categories } from '../src/lib/data/categories';
import { certifyingBodies } from '../src/lib/data/certifying-bodies';
import { kbArticles } from '../src/lib/data/kb-articles';
import { blogPosts } from '../src/lib/data/blog';
import { glossaryTerms } from '../src/lib/data/glossary';
import { serviceProviders } from '../src/lib/data/service-providers';

function esc(value: unknown): string {
	if (value === null || value === undefined) return 'NULL';
	if (typeof value === 'number') return String(value);
	if (typeof value === 'boolean') return value ? '1' : '0';
	return `'${String(value).replace(/'/g, "''")}'`;
}

function now(): number {
	return Math.floor(Date.now() / 1000);
}

const stmts: string[] = [];

// Clear tables (reverse dependency order)
for (const t of ['inquiries', 'products', 'suppliers', 'pages', 'knowledge_base', 'service_providers', 'certifying_bodies', 'categories', 'media', 'site_settings']) {
	stmts.push(`DELETE FROM "${t}";`);
}

// Categories
for (const c of categories) {
	stmts.push(`INSERT INTO "categories" ("slug","name","description","parent_slug","icon","sort_order","created_at","updated_at") VALUES (${esc(c.slug)},${esc(c.name)},${esc(c.description ?? null)},${esc(c.parentSlug ?? null)},${esc(c.icon ?? null)},${c.sortOrder ?? 0},${now()},${now()});`);
}

// Certifying Bodies
for (const cb of certifyingBodies) {
	stmts.push(`INSERT INTO "certifying_bodies" ("id","name","country","standard","website","description","status","created_at","updated_at") VALUES (${esc(cb.id)},${esc(cb.name)},${esc(cb.country)},${esc(cb.standard ?? null)},NULL,NULL,'active',${now()},${now()});`);
}

// Suppliers
for (const s of suppliers) {
	stmts.push(`INSERT INTO "suppliers" ("slug","name","country","business_type","is_brand","status","logo_initials","description","cover_image","website","email","phone","whatsapp","line","year_established","employee_count","production_capacity","main_markets","certifications","created_at","updated_at") VALUES (${esc(s.slug)},${esc(s.name)},${esc(s.country)},${esc(s.businessType)},${s.isBrand ? 1 : 0},${esc(s.status)},${esc(s.logoInitials ?? null)},${esc(s.description ?? null)},${esc(s.coverImage ?? null)},${esc(s.website ?? null)},${esc(s.email ?? null)},${esc(s.phone ?? null)},${esc(s.whatsapp ?? null)},${esc(s.line ?? null)},${esc(s.yearEstablished ?? null)},${esc(s.employeeCount ?? null)},${esc(s.productionCapacity ?? null)},${esc(s.mainMarkets ? JSON.stringify(s.mainMarkets) : null)},${esc(JSON.stringify(s.certifications))},${now()},${now()});`);
}

// Products
for (const p of products) {
	stmts.push(`INSERT INTO "products" ("slug","supplier_slug","category_slug","name","short_description","description","image","images","videos","moq","price_min","price_max","price_unit","cert_status","units","origin_country","features","specifications","faqs","resources","status","views","created_at","updated_at") VALUES (${esc(p.slug)},${esc(p.supplierSlug)},${esc(p.categorySlug)},${esc(p.name)},${esc(p.shortDescription ?? null)},${esc(p.description ?? null)},${esc(p.image ?? null)},${esc(p.images ? JSON.stringify(p.images) : null)},${esc(p.videos ? JSON.stringify(p.videos) : null)},${esc(p.moq ?? null)},${esc(p.priceMin ?? null)},${esc(p.priceMax ?? null)},${esc(p.priceUnit ?? null)},${esc(p.certStatus)},${esc(p.units ?? null)},${esc(p.originCountry ?? null)},${esc(JSON.stringify(p.features))},${esc(p.specifications ? JSON.stringify(p.specifications) : null)},${esc(p.faqs ? JSON.stringify(p.faqs) : null)},${esc(p.resources ? JSON.stringify(p.resources) : null)},${esc(p.status ?? 'active')},${esc(p.views ?? 0)},${now()},${now()});`);
}

// Knowledge Base
for (const a of kbArticles) {
	stmts.push(`INSERT INTO "knowledge_base" ("slug","section","title","summary","body","tags","author","status","views","created_at","updated_at") VALUES (${esc(a.slug)},${esc(a.section)},${esc(a.title)},${esc(a.summary ?? null)},${esc(a.body ?? null)},${esc(JSON.stringify(a.tags))},${esc(a.author ?? null)},${esc(a.status ?? 'published')},${esc(a.views ?? 0)},${now()},${now()});`);
}

// Blog posts as pages (type='blog')
for (const p of blogPosts) {
	stmts.push(`INSERT INTO "pages" ("slug","title","type","excerpt","body","author","category","featured_image","tags","meta_title","meta_description","keywords","status","views","published_at","created_at","updated_at") VALUES (${esc(p.slug)},${esc(p.title)},'blog',${esc(p.excerpt ?? null)},${esc(p.body ?? null)},${esc(p.author ?? null)},'blog',NULL,${esc(p.tags ? JSON.stringify(p.tags) : null)},NULL,NULL,NULL,${esc(p.status ?? 'draft')},0,${esc(p.date ? Math.floor(new Date(p.date).getTime() / 1000) : null)},${now()},${now()});`);
}

// Glossary terms as pages (type='landing', category='glossary')
for (const t of glossaryTerms) {
	const slug = `glossary-${t.term.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
	stmts.push(`INSERT INTO "pages" ("slug","title","type","excerpt","body","author","category","featured_image","tags","meta_title","meta_description","keywords","status","views","published_at","created_at","updated_at") VALUES (${esc(slug)},${esc(t.term)},'landing',${esc(t.definition ?? null)},${esc(t.definition ?? null)},NULL,'glossary',NULL,NULL,${esc(t.term)},${esc(t.definition ?? null)},NULL,'published',0,NULL,${now()},${now()});`);
}

// Service Providers
for (const sp of serviceProviders) {
	stmts.push(`INSERT INTO "service_providers" ("slug","name","type","country","description","website","email","phone","whatsapp","line","rating","status","created_at","updated_at") VALUES (${esc(sp.slug)},${esc(sp.name)},${esc(sp.type)},${esc(sp.country)},${esc(sp.description ?? null)},${esc(sp.website ?? null)},${esc(sp.email ?? null)},${esc(sp.phone ?? null)},${esc(sp.whatsapp ?? null)},${esc(sp.line ?? null)},${esc(sp.rating ?? null)},${esc(sp.status)},${now()},${now()});`);
}

writeFileSync('drizzle/d1_seed.sql', stmts.join('\n'));
console.log(`Generated d1_seed.sql with ${stmts.length} statements`);
console.log(`  categories: ${categories.length}`);
console.log(`  certifyingBodies: ${certifyingBodies.length}`);
console.log(`  suppliers: ${suppliers.length}`);
console.log(`  products: ${products.length}`);
console.log(`  kbArticles: ${kbArticles.length}`);
console.log(`  blogPosts: ${blogPosts.length}`);
console.log(`  glossaryTerms: ${glossaryTerms.length}`);
console.log(`  serviceProviders: ${serviceProviders.length}`);
