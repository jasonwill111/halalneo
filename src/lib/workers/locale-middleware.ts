/**
 * Localization Middleware
 * Detects user locale from URL, cookie, or browser and serves translated content
 */

export interface Translation {
  title: string;
  description: string;
  [key: string]: string; // For Snippet content
}

export interface PageTranslation {
  [key: string]: Translation;
}

// Currently only implemented for home page components
interface TranslationSet {
  home: Translation;
  // add other pages as needed
}

// Language configuration
const SUPPORTED_LOCALES = ['en', 'ar', 'tr', 'id', 'ms', 'bn', 'ur'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

// Translation data for each locale (initialize empty for now, populated by Paraglide)
const translations: TranslationSet = {
  home: {
    title: 'Halal trade intelligence.',
    description: 'Research certification bodies, verify suppliers, and navigate global halal markets — all in one place.'
  }
};

/**
 * Get locale from request
 * Priority: URL param > Cookie > Browser Accept-Language
 */
export function getLocale(request: Request): SupportedLocale {
  // Extract locale from URL path
  const url = new URL(request.url);
  const locale = url.pathname.split('/')[1];
  
  if (SUPPORTED_LOCALES.includes(locale as SupportedLocale)) {
    return locale as SupportedLocale;
  }
  
  // Check cookie
  const cookie = request.headers.get('Cookie');
  if (cookie) {
    const match = cookie.match(/preferred_locale=([a-z]+)/i);
    if (match && SUPPORTED_LOCALES.includes(match[1] as SupportedLocale)) {
      return match[1] as SupportedLocale;
    }
  }
  
  // Check browser Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language');
  if (acceptLanguage) {
    // Parse Accept-Language headers (simplified)
    const preferred = acceptLanguage.split(',')[0].split('-')[0].toLowerCase();
    if (SUPPORTED_LOCALES.includes(preferred as SupportedLocale)) {
      return preferred as SupportedLocale;
    }
  }
  
  // Default to English
  return 'en';
}

/**
 * Set locale cookie
 */
export function setLocaleCookie(resHeaders: Headers, locale: SupportedLocale): void {
  resHeaders.set('Set-Cookie', `preferred_locale=${locale}; Path=/; Max-Age=31536000; SameSite=Strict`);
}

/**
 * Generate hreflang tags for all supported locales
 */
export function generateHreflangTags(basePath: string, currentPage?: string): string[] {
  const tags: string[] = [];
  
  for (const locale of SUPPORTED_LOCALES) {
    let urlPath = basePath;
    
    if (locale === 'en') {
      // English is default, no locale prefix
      urlPath = urlPath.split('/').slice(1).join('/');
    } else {
      urlPath = `/${locale}${urlPath}`;
    }
    
    tags.push(`<link rel="alternate" hreflang="${locale}" href="${urlPath}" />`);
  }
  
  tags.push(`<link rel="alternate" hreflang="x-default" href="${basePath}" />`);
  
  return tags;
}

/**
 * Get translated content for a snippet
 */
export function getSnippetContent(snippetName: keyof TranslationSet, locale: SupportedLocale): string {
  // For now, return English template. In production, this would load from Paraglide messages
  // or from locale-specific Svelte files
  
  const localeFile = `/src/lib/translations/${locale}/${snippetName}.svelte`;
  
  // Placeholder - actual implementation would dynamically load components
  if (locale === 'en') {
    return `Hello World`;
  }
  
  // Would load actual translated content
  return '';
}

/**
 * Apply localization to HTML content
 */
export function localizeContent(content: string, locale: SupportedLocale): string {
  // This would use ParaglideJS to replace strings
  // For now, returns content as-is
  
  // Future: use Paraglide runtime to replace with translated content
  return content;
}

/**
 * Get locale-specific title and description
 */
export function getLocalizedMetadata(
  page: string,
  defaults: { title: string; description: string }
): { title: string; description: string } {
  
  // In production, would use Paraglide translation
  // For now, returns English defaults
  return defaults;
}

/**
 * Translate a string using available translations
 */
export function t(key: string, locale: SupportedLocale = 'en'): string {
  // Simple mock - would be implemented with Paraglide
  return key;
}

/**
 * Translation helper for components
 */
export function createTranslator(locale: SupportedLocale) {
  return function t(key: string): string {
    return t(key, locale);
  };
}
