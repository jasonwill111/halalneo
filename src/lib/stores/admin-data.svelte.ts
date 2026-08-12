import { merchants as seedMerchants } from '$lib/data/merchants';
import { skus as seedSkus } from '$lib/data/skus';
import { categories as seedCategories } from '$lib/data/categories';
import { certifyingBodies as seedBodies } from '$lib/data/certifying-bodies';
import { kbSections as seedSections } from '$lib/data/kb-sections';
import { kbArticles as seedArticles } from '$lib/data/kb-articles';
import { glossaryTerms as seedGlossary } from '$lib/data/glossary';
import { blogPosts as seedBlogPosts } from '$lib/data/blog';
import { aiTools as seedAiTools } from '$lib/data/ai-tools';
import type {
	Merchant,
	Sku,
	Category,
	CertifyingBody,
	KbSection,
	KbArticle,
	GlossaryTerm,
	BlogPost,
	AiTool,
	SiteSettings
} from '$lib/data/types';

const PREFIX = 'halalneo:admin:v1:';

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

export const adminData = $state({
	merchants: readCollection<Merchant>('merchants', seedMerchants),
	skus: readCollection<Sku>('skus', seedSkus),
	categories: readCollection<Category>('categories', seedCategories),
	certifyingBodies: readCollection<CertifyingBody>('certifyingBodies', seedBodies),
	kbSections: readCollection<KbSection>('kbSections', seedSections),
	kbArticles: readCollection<KbArticle>('kbArticles', seedArticles),
	glossary: readCollection<GlossaryTerm>('glossary', seedGlossary),
	blogPosts: readCollection<BlogPost>('blogPosts', seedBlogPosts),
	aiTools: readCollection<AiTool>('aiTools', seedAiTools)
});

export const adminSettings = $state<SiteSettings>(readSettings());

function persist(collection: 'merchants' | 'skus' | 'categories' | 'certifyingBodies' | 'kbSections' | 'kbArticles' | 'glossary' | 'blogPosts' | 'aiTools') {
	writeCollection(collection, adminData[collection] as unknown[]);
}

// --- generic CRUD helpers ---

export function upsertItem<T extends { slug?: string; id?: string; term?: string }>(
	collection: 'merchants' | 'skus' | 'categories' | 'kbSections' | 'kbArticles' | 'glossary' | 'blogPosts' | 'aiTools' | 'certifyingBodies',
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
	collection: 'merchants' | 'skus' | 'categories' | 'kbSections' | 'kbArticles' | 'glossary' | 'blogPosts' | 'aiTools' | 'certifyingBodies',
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

export function resetCollection(collection: 'merchants' | 'skus' | 'categories' | 'certifyingBodies' | 'kbSections' | 'kbArticles' | 'glossary' | 'blogPosts' | 'aiTools') {
	const seedMap = {
		merchants: seedMerchants,
		skus: seedSkus,
		categories: seedCategories,
		certifyingBodies: seedBodies,
		kbSections: seedSections,
		kbArticles: seedArticles,
		glossary: seedGlossary,
		blogPosts: seedBlogPosts,
		aiTools: seedAiTools
	} as const;
	const list = adminData[collection] as unknown[];
	list.splice(0, list.length, ...(seedMap[collection] as unknown[]));
	persist(collection as 'merchants');
}

// --- getters that read the reactive store (frontend pages consume these so admin CRUD reflects live) ---

export function getSku(slug: string): Sku | undefined {
	return adminData.skus.find((s) => s.slug === slug);
}

export function getMerchant(slug: string): Merchant | undefined {
	return adminData.merchants.find((m) => m.slug === slug);
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