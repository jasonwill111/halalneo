import { suppliers as seedSuppliers } from '#lib/data/suppliers.js';
import { products as seedProducts } from '#lib/data/products.js';
import { categories as seedCategories } from '#lib/data/categories.js';
import { certifyingBodies as seedBodies } from '#lib/data/certifying-bodies.js';
import { kbSections as seedSections } from '#lib/data/kb-sections.js';
import { kbArticles as seedArticles } from '#lib/data/kb-articles.js';
import { glossaryTerms as seedGlossary } from '#lib/data/glossary.js';
import { blogPosts as seedBlogPosts } from '#lib/data/blog.js';
import { aiTools as seedAiTools } from '#lib/data/ai-tools.js';
import { serviceProviders as seedServiceProviders } from '#lib/data/service-providers.js';
import { marketGuides as seedMarketGuides } from '#lib/data/market-guides.js';
import { tradeShows as seedTradeShows } from '#lib/data/trade-shows.js';
import type {
	Supplier,
	Product,
	Category,
	CertifyingBody,
	KbSection,
	KbArticle,
	GlossaryTerm,
	BlogPost,
	AiTool,
	ServiceProvider,
	MarketGuide,
	TradeShow,
	Page,
	Inquiry,
	SiteSettings
} from '#lib/data/types.js';

const PREFIX = 'halalneo:admin:v1:';

const seedPages: Page[] = [
	{
		slug: 'about-us',
		title: 'About HalalNeo',
		type: 'landing',
		excerpt: 'Learn about our mission to connect halal suppliers with global buyers.',
		body: 'HalalNeo is the leading B2B marketplace for halal-certified products...',
		status: 'published',
		views: 1240
	},
	{
		slug: 'how-it-works',
		title: 'How It Works',
		type: 'landing',
		excerpt: 'A step-by-step guide to using HalalNeo for your sourcing needs.',
		body: 'Getting started on HalalNeo is simple...',
		status: 'published',
		views: 890
	},
	{
		slug: 'halal-market-trends-2025',
		title: 'Halal Market Trends 2025',
		type: 'blog',
		excerpt: 'Key trends shaping the global halal industry this year.',
		body: 'The global halal market continues to grow...',
		status: 'draft',
		views: 0
	}
];

const seedInquiries: Inquiry[] = [
	{
		id: 'INQ-001',
		buyerSlug: 'gulf-food-trading',
		supplierSlug: 'halal-trust-certification',
		productSlug: 'halal-chicken-breast',
		subject: 'Certification inquiry for bulk order',
		message:
			'We are looking to source 20 tonnes of halal-certified chicken breast for our distribution network in Dubai. Can you confirm your certification scope covers poultry products?',
		status: 'active'
	},
	{
		id: 'INQ-002',
		buyerSlug: 'euro-halal-imports',
		supplierSlug: 'safefood-audit',
		subject: 'BPJPH certification process',
		message:
			'We need guidance on the BPJPH certification process for exporting cosmetics to Indonesia. What documentation is required?',
		status: 'pending'
	},
	{
		id: 'INQ-003',
		buyerSlug: 'asia-halal-market',
		supplierSlug: 'gulf-halal-standards',
		productSlug: 'organic-date-syrup',
		subject: 'GSO compliance check',
		message:
			'Could you verify if your GSO 2055 certificate covers organic date syrup products? We need this for customs clearance in Saudi Arabia.',
		status: 'flagged'
	}
];

function readCollection<T>(key: string, seed: T[]): T[] {
	if (typeof localStorage === 'undefined') return [...seed];
	try {
		const raw = localStorage.getItem(PREFIX + key);
		if (!raw) return [...seed];
		const parsed = JSON.parse(raw) as T[];
		return Array.isArray(parsed) ? parsed : [...seed];
	} catch {
		return [...seed];
	}
}

function writeCollection<T>(key: string, value: T[]) {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(PREFIX + key, JSON.stringify(value));
	} catch {
		// ignore quota / private mode errors
	}
}

function readSettings(): SiteSettings {
	const defaults: SiteSettings = {
		siteName: 'HalalNeo',
		tagline: 'Halal trade intelligence for buyers and suppliers',
		supportEmail: 'support@halalneo.example',
		contactEmail: 'hello@halalneo.example',
		enableDemoNotice: true,
		enableMaintenanceMode: false
	};
	if (typeof localStorage === 'undefined') return defaults;
	try {
		const raw = localStorage.getItem(PREFIX + 'settings');
		return raw ? { ...defaults, ...(JSON.parse(raw) as Partial<SiteSettings>) } : defaults;
	} catch {
		return defaults;
	}
}

function writeSettings(settings: SiteSettings) {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(PREFIX + 'settings', JSON.stringify(settings));
	} catch {
		// ignore
	}
}

// $state.raw: collections are only ever replaced wholesale (never mutated
// in place) — avoids deeply proxying this large object. Reassignments still
// trigger reactivity.
export const adminData = $state.raw({
	suppliers: readCollection<Supplier>('suppliers', seedSuppliers),
	products: readCollection<Product>('products', seedProducts),
	categories: readCollection<Category>('categories', seedCategories),
	certifyingBodies: readCollection<CertifyingBody>('certifyingBodies', seedBodies),
	kbSections: readCollection<KbSection>('kbSections', seedSections),
	kbArticles: readCollection<KbArticle>('kbArticles', seedArticles),
	glossary: readCollection<GlossaryTerm>('glossary', seedGlossary),
	blogPosts: readCollection<BlogPost>('blogPosts', seedBlogPosts),
	aiTools: readCollection<AiTool>('aiTools', seedAiTools),
	serviceProviders: readCollection<ServiceProvider>('serviceProviders', seedServiceProviders),
	marketGuides: readCollection<MarketGuide>('marketGuides', seedMarketGuides),
	tradeShows: readCollection<TradeShow>('tradeShows', seedTradeShows),
	pages: readCollection<Page>('pages', seedPages),
	inquiries: readCollection<Inquiry>('inquiries', seedInquiries)
});

export const adminSettings = $state.raw<SiteSettings>(readSettings());

export function persist(
	collection:
		| 'suppliers'
		| 'products'
		| 'categories'
		| 'certifyingBodies'
		| 'kbSections'
		| 'kbArticles'
		| 'glossary'
		| 'blogPosts'
		| 'aiTools'
		| 'serviceProviders'
		| 'marketGuides'
		| 'tradeShows'
		| 'pages'
		| 'inquiries'
) {
	writeCollection(collection, adminData[collection] as unknown[]);
}

// --- generic CRUD helpers ---

export function upsertItem<T extends { slug?: string; id?: string; term?: string }>(
	collection:
		| 'suppliers'
		| 'products'
		| 'categories'
		| 'kbSections'
		| 'kbArticles'
		| 'glossary'
		| 'blogPosts'
		| 'aiTools'
		| 'certifyingBodies'
		| 'serviceProviders'
		| 'marketGuides'
		| 'tradeShows'
		| 'pages'
		| 'inquiries',
	item: T,
	existing?: T
) {
	const list = adminData[collection] as unknown as T[];
	const key = item.slug ?? item.id ?? item.term;
	const listKey = existing?.slug ?? existing?.id ?? existing?.term;
	if (!item || !key) return;
	if (listKey) {
		const idx = list.findIndex((it) => (it.slug ?? it.id ?? it.term) === listKey);
		if (idx >= 0) {
			list[idx] = { ...existing, ...item };
			persist(collection);
			return;
		}
	}
	list.push(item);
	persist(collection);
}

export function deleteItem(
	collection:
		| 'suppliers'
		| 'products'
		| 'categories'
		| 'kbSections'
		| 'kbArticles'
		| 'glossary'
		| 'blogPosts'
		| 'aiTools'
		| 'certifyingBodies'
		| 'serviceProviders'
		| 'marketGuides'
		| 'tradeShows'
		| 'pages'
		| 'inquiries',
	key: string
) {
	const list = adminData[collection] as Array<{ slug?: string; id?: string; term?: string }>;
	const idx = list.findIndex((it) => (it.slug ?? it.id ?? it.term) === key);
	if (idx >= 0) {
		list.splice(idx, 1);
		persist(collection);
	}
}

export function updateSettings(patch: Partial<SiteSettings>) {
	Object.assign(adminSettings, patch);
	writeSettings(adminSettings);
}

export function resetCollection(
	collection:
		| 'suppliers'
		| 'products'
		| 'categories'
		| 'certifyingBodies'
		| 'kbSections'
		| 'kbArticles'
		| 'glossary'
		| 'blogPosts'
		| 'aiTools'
		| 'serviceProviders'
		| 'marketGuides'
		| 'tradeShows'
		| 'pages'
		| 'inquiries'
) {
	const seedMap = {
		suppliers: seedSuppliers,
		products: seedProducts,
		categories: seedCategories,
		certifyingBodies: seedBodies,
		kbSections: seedSections,
		kbArticles: seedArticles,
		glossary: seedGlossary,
		blogPosts: seedBlogPosts,
		aiTools: seedAiTools,
		serviceProviders: seedServiceProviders,
		marketGuides: seedMarketGuides,
		tradeShows: seedTradeShows,
		pages: seedPages,
		inquiries: seedInquiries
	} as const;
	const list = adminData[collection] as unknown[];
	list.splice(0, list.length, ...(seedMap[collection] as unknown[]));
	persist(collection as 'suppliers');
}

// --- getters that read the reactive store (frontend pages consume these so admin CRUD reflects live) ---

export function getProduct(slug: string): Product | undefined {
	return adminData.products.find((s) => s.slug === slug);
}

export function getSupplier(slug: string): Supplier | undefined {
	return adminData.suppliers.find((s) => s.slug === slug);
}

export function getCategory(slug: string): Category | undefined {
	return adminData.categories.find((c) => c.slug === slug);
}

export function getSection(slug: string): KbSection | undefined {
	return adminData.kbSections.find((s) => s.slug === slug);
}

export function getArticle(section: string, slug: string): KbArticle | undefined {
	return adminData.kbArticles.find((a) => a.section === section && a.slug === slug);
}

export function getArticlesInSection(section: string): KbArticle[] {
	return adminData.kbArticles.filter((a) => a.section === section);
}

export function getBody(id: string): CertifyingBody {
	return (
		adminData.certifyingBodies.find((b) => b.id === id) ?? {
			id,
			name: id,
			country: '',
			standard: ''
		}
	);
}

export function getGlossaryTerm(term: string): GlossaryTerm | undefined {
	return adminData.glossary.find((g) => g.term === term);
}

export function getServiceProvider(slug: string): ServiceProvider | undefined {
	return adminData.serviceProviders.find((s) => s.slug === slug);
}

export function getMarketGuide(slug: string): MarketGuide | undefined {
	return adminData.marketGuides.find((g) => g.slug === slug);
}

export function getTradeShow(id: string): TradeShow | undefined {
	return adminData.tradeShows.find((s) => s.id === id);
}
