// I18n Layout Service - manages hreflang and multi-page rendering for SvelteKit
import { baseLocale } from '$lib/paraglide/runtime';

// Supported locales with metadata
export const SUPPORTED_LOCALES = [
	'ar', // Arabic
	'bn', // Bengali
	'en', // English
	'id', // Indonesian
	'ms', // Malay
	'tr', // Turkish
	'ur'  // Urdu
] as const;

export const LOCALE_DISPLAY = {
	ar: 'العربية',
	bn: 'বাংলা',
	en: 'English',
	id: 'Bahasa Indonesia',
	ms: 'Bahasa Melayu',
	tr: 'Türkçe',
	ur: 'اردو'
};

export function generateHreflangLinks(path: string, baseUrl: string) {
	return SUPPORTED_LOCALES.map(locale => ({
		rel: 'alternate',
		hreflang: locale,
		href: `${baseUrl}/${locale}${path === '/' ? '' : path}`,
		dir: locale === 'ar' || locale === 'ur' ? 'rtl' : 'ltr'
	}));
}

export function generateXDefaultLink(path: string, baseUrl: string) {
	return {
		rel: 'alternate',
		hreflang: 'x-default',
		href: `${baseUrl}${path === '/' ? '' : path}`
	};
}

export function getMetaTags(path: string, baseUrl: string) {
	return {
		hreflang: generateHreflangLinks(path, baseUrl),
		xDefault: generateXDefaultLink(path, baseUrl)
	};
}
