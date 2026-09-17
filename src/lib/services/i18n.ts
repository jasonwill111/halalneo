import { baseLocale, locales } from '#lib/paraglide/runtime';
import { getLocale } from '#lib/paraglide/runtime';

// Supported locales with native names and writing direction
export const LOCALE_CONFIG = {
	en: {
		name: 'English',
		flag: '🇬🇧',
		dir: 'ltr',
		alpha: 'en',
		translations: {}
	},
	ar: {
		name: 'العربية',
		flag: '🇸🇦',
		dir: 'rtl',
		alpha: 'ar',
		translations: {}
	},
	tr: {
		name: 'Türkçe',
		flag: '🇹🇷',
		dir: 'ltr',
		alpha: 'tr',
		translations: {}
	},
	id: {
		name: 'Bahasa Indonesia',
		flag: '🇮🇩',
		dir: 'ltr',
		alpha: 'id',
		translations: {}
	},
	ms: {
		name: 'Bahasa Melayu',
		flag: '🇲🇾',
		dir: 'ltr',
		alpha: 'ms',
		translations: {}
	},
	bn: {
		name: 'বাংলা',
		flag: '🇧🇩',
		dir: 'ltr',
		alpha: 'bn',
		translations: {}
	},
	ur: {
		name: 'اردو',
		flag: '🇵🇰',
		dir: 'rtl',
		alpha: 'ur',
		translations: {}
	}
};

// Market guides mapping for use in hreflang
export function getHreflangLinks(baseExcluded: string[] = []) {
	// Get current locale from ParaglideJS
	const currentLocale = getLocale();
	
	// Build hreflang links for all supported locales
	const hreflangLinks = Object.entries(LOCALE_CONFIG)
		.filter(([locale]) => !baseExcluded.includes(locale))
		.map(([locale, config]) => ({
			href: `/${locale}`,
			lang: config.alpha,
			dir: config.dir
		}));
	
	// Add current locale as self-reference
	hreflangLinks.push({ href: '', lang: currentLocale, dir: LOCALE_CONFIG[currentLocale]?.dir || 'ltr' });
	
	return hreflangLinks;
}

// Generate localized URLs for product/supplier pages
export function localizeUrl(url: string, locale: string = getLocale()): string {
	if (locales) {
		// Remove locale prefix if present
		const path = url.replace(`/${locale}`, '');
		const pathPrefix = path.replace('/', '');
		if (locale === baseLocale) {
			return pathPrefix || '/';
		}
		return `/${locale}${pathPrefix}`;
	}
	return url;
}

// Detect content relevance based on region/language
export function getRegionalContent(content: Record<string, any>): any {
	const locale = getLocale();
	
	// Prioritize content tagged for current locale
	if (content[locale]) {
		return content[locale].data;
	}
	
	// Fall back to base locale content
	if (content[baseLocale]) {
		return content[baseLocale].data;
	}
	
	// Default to first available
	return Object.values(content)[0]?.data || null;
}

// Check if locale is supported for market guide
export function isSupportedLocaleForRegion(fetchRegion: string): boolean {
	const regionSupport = {
		'Middle East': ['ar', 'tr', 'ur', 'en'],
		'South Asia': ['bn', 'ur', 'en', 'id'],
		'Africa': ['en', 'ar', 'tr'],
		'Southeast Asia': ['id', 'ms', 'en', 'tr'],
		'Europe': ['tr', 'en', 'ar'],
		'North America': ['en', 'ar']
	};
	
	const locale = getLocale();
	return regionSupport[fetchRegion]?.includes(locale) || false;
}

// Generate canonical URL for current page
export function generateCanonicalUrl(): string {
	const currentPath = window.location.pathname;
	const locale = getLocale();
	
	// Base URL (domain) - can be obtained from document
	const domain = window.location.origin;
	
	// Remove locale prefix from path if present
	const cleanPath = currentPath.replace(`/${locale}`, '');
	
	// For base locale, no prefix needed
	if (locale === baseLocale) {
		return `${domain}${cleanPath}`;
	}
	
	return `${domain}${currentPath}`;
}

// Helper to get market guides based on locale
export function getLocaleSpecificGuides(guides: Array<{slug: string; region: string}>): any[] {
	const locale = getLocale();
	
	// For Arabic speakers, prioritize Middle East and Africa guides
	// For Turkish speakers, prioritize Europe and Middle East
	// For Indo-Malaysian speakers, prioritize Southeast Asia
	return guides
		.filter(guide => isSupportedLocaleForRegion(guide.region))
		.map(guide => ({ ...guide, localeSpecific: true }));
}
