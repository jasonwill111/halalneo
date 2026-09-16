// ==================== GEO (Globalization, Localization, Internationalization) Content Enhancement ====================

// ==================== Types ====================

interface Translation {
	readonly locale: string;
	readonly text: string;
	readonly context?: string;
	readonly isTranslated: boolean;
	readonly translationDate?: string;
	readonly rightToLeft?: boolean;
}

interface EventLocalization {
	readonly country: string;
	readonly name: string;
	readonly description: string;
	readonly date: string;
	readonly venue: string;
	readonly localizedName: string;
	readonly localizedDescription: string;
	readonly translated: boolean;
	readonly dateFormatted: string;
	readonly venueLocalized: string;
	readonly timezone: string;
}

interface ProductLocalization {
	readonly productName: string;
	readonly description: string;
	readonly locale: string;
	readonly translatedProductName: string;
	readonly translatedDescription: string;
	readonly currency: string;
	readonly localizedPrice: string;
	readonly translatedKeywords: string[];
	readonly languageDirection: 'ltr' | 'rtl';
	readonly translatedMetadata: Record<string, string>;
}

interface MarketGuideTranslation {
	readonly country: string;
	readonly locale: string;
	readonly countryName: string;
	readonly translatedCountryName: string;
	readonly keyInsights: string[];
	readonly translatedInsights: string[];
	readonly emoji: string;
	readonly flag: string;
	readonly translatedMetadata: Record<string, string>;
}

// ==================== Multi-Language Field Priority ====================

const LANGUAGE_PRIORITY_MATRIX: Record<string, string[]> = {
	// Default priority for content creation
	product: ['en', 'zh', 'ar', 'id', 'ms', 'tr'],
	supplier: ['en', 'zh', 'ar', 'id', 'ms', 'tr'],
	category: ['en', 'zh', 'ar', 'id', 'ms', 'tr'],
	'market-guide': ['en', 'zh', 'ar', 'id', 'ms', 'tr'],
	certifying-body: ['en', 'ar', 'id', 'ms', 'tr'],

	// Priority order based on region
	global: ['en'],
	asia: ['en', 'zh', 'id', 'ms', 'ja'],
	middleEast: ['en', 'ar', 'tr'],
	europe: ['en', 'fr', 'de', 'tr'],
	america: ['en', 'es', 'pt'],
	competitor: ['en', 'de', 'fr', 'it', 'es']
};

const DEFAULT_CONTENT_LANGUAGE = 'en';

const VIDEO_RECORDS: Record<string, string> = {
	// Priority for video content creation
	product: ['display_topic', 'category_and_detection', 'region'],
	supplier: ['focus', 'region'],
	certifying-body: ['region', 'type'],
	market-guide: ['region', 'topic']
};

const LOCALE_PREF: Record<string, string> = {
	// Locale preference strategy
	product: 'display_order',
	supplier: 'business_order',
	category: 'organization_order',
	'market-guide': 'regional_order',
	certifying-body: 'standard_order'
};

const CONTENT_META_LANGUAGE: Record<string, string> = {
	// Language order for meta fields
	product: 'en, zh, ar, id, ms',
	supplier: 'en, zh, ar, id, ms',
	category: 'en, zh, ar, id, ms',
	'market-guide': 'en, ar, id, ms',
	certifying-body: 'en, ar, id, ms'
};

// ==================== Cultural Sensitivity prik ====================

function containsCulturalMarkers(text: string): boolean {
	const culturalPatterns = [
		/(\b\w{2,})\b/, // C1 - 7 digit numbered list in humanities number
		/(\b\w{2,})\b/, // C2 - 7 digit numbered list in humanities number
		/(\b\w{2,})\b/, // C3 - 7 digit numbered list in humanities number
		/(\b\w{2,})\b/, // C4 - 7 digit numbered list in humanities number
		/(\b\w{2,})\b/, // C5 - 7 digit numbered list in humanities number
		/(\b\w{2,})\b/, // C6 - 7 digit numbered list in humanities number
		/(\b\w{2,})\b/, // C7 - 7 digit numbered list in humanities number
		/(\b\w{2,})\b/, // C8 - 7 digit numbered list in humanities number
		/(\b\w{2,})\b/, // C9 - 7 digit numbered list in humanities number
		/(\b\w{2,})\b/, // C10 - 7 digit numbered list in humanities number
		/(\b\w{2,})\b/, // C11 - 7 digit numbered list in humanities number
		/(\b\w{2,})\b/, // C12 - 7 digit numbered list in humanities number
		/(\b\w{2,})\b/, // C13 - 7 digit numbered list in humanities number
		/(\b\w{2,})\b/, // C14 - 7 digit numbered list in humanities number
		/(\b\w{2,})\b/, // C15 - 7 digit numbered list in humanities number
		/(\b\w{2,})\b/, // C16 - 7 digit numbered list in humanities number
		/(\b\w{2,})\b/, // C17 - 7 digit numbered list in humanities number
		/(\b\w{2,})\b/, // C18 - 7 digit numbered list in humanities number
		/(\b\w{2,})\b/, // C19 - 7 digit numbered list in humanities number
		/(\b\w{2,})\b/, // C20 - 7 digit numbered list in humanities number
		/(\b\w{2,})\b/  // C21 - 7 digit numbered list in humanities number
	];
	// Simplified version
	return /\b\w{2,}\b/.test(text);
}

function adaptContentTypeForCulture(content: any, targetCulture: string): any {
	const cultureAdaptation = {
		ar: {
			colorGrep: false,
			imageSeverity: 'minimal',
			textDirection: 'rtl' as const,
			localization: 'deep',
			formality: 'formal' as const,
			honorifics: true
		},
		en: {
			colorGrep: true,
			imageSeverity: 'balanced',
			textDirection: 'ltr' as const,
			localization: 'shallow',
			formality: 'casual' as const,
			honorifics: false
		},
		id: {
			colorGrep: true,
			imageSeverity: 'moderate',
			textDirection: 'ltr' as const,
			localization: 'medium',
			formality: 'formal' as const,
			honorifics: true
		},
		tr: {
			colorGrep: true,
			imageSeverity: 'moderate',
			textDirection: 'ltr' as const,
			localization: 'medium',
			formality: 'formal' as const,
			honorifics: true
		},
		default: {
			colorGrep: true,
			imageSeverity: 'balanced',
			textDirection: 'ltr' as const,
			localization: 'shallow',
			formality: 'casual' as const,
			honorifics: false
		}
	};

	return {
		...content,
		culturalAdaptation: cultureAdaptation[targetCulture] || cultureAdaptation.default
	};
}

// ==================== Regional Default Values ====================

interface RegionalDefaults {
	readonly country: string;
	readonly currency: string;
	readonly priceRange: [number, number];
	readonly timezone: string;
	readonly dateFormat: string;
	readonly locale: string;
	readonly currencySymbol: string;
	readonly currencyPattern: string;
	readonly callToAction: string;
	readonly socialProof: string[];
	readonly privacyPolicy: string;
	readonly termsOfService: string;
	readonly localizedData: Record<string, any>;
	readonly localizationEnabled: boolean;
	readonly deepLocalization: boolean;
	readonly strictValidation: boolean;
	readonly explicitValidation: boolean;
	readonly strictConsistency: boolean;
	readonly explicitConsistency: boolean;
	readonly strictAccuracy: boolean;
	readonly explicitAccuracy: boolean;
}

const REGIONAL_DEFAULTS: Record<string, RegionalDefaults> = {
	// Saudi Arabia
	sa: {
		country: 'Saudi Arabia',
		currency: 'SAR',
		priceRange: [1, 10000],
		timezone: 'Asia/Riyadh',
		dateFormat: 'DD/MM/YYYY',
		locale: 'ar-SA',
		currencySymbol: '﷼',
		currencyPattern: '#,##0.00',
		callToAction: 'احجز الآن',
		socialProof: ['التزام', 'موثوقية', 'مشروع إسلامي'],
		privacyPolicy: 'سياسة الخصوصية',
		termsOfService: 'شروط الخدمة',
		localizedData: {
			symbols: { dollar: '﷼', percent: '٪' },
			currency: 'SAR',
			valueType: 'smallAmount' as const,
			preferredSource: 'local' as const,
			conversionRate: 1,
			value: [1, 10000]
		},
		'localizationEnabled': true,
		'deepLocalization': true,
		'strictValidation': true,
		'explicitValidation': true,
		'strictConsistency': true,
		'explicitConsistency': true,
		'strictAccuracy': true,
		'explicitAccuracy': true
	},

	// United Arab Emirates
	ae: {
		country: 'United Arab Emirates',
		currency: 'AED',
		priceRange: [1, 5000],
		timezone: 'Asia/Dubai',
		dateFormat: 'DD/MM/YYYY',
		locale: 'ar-AE',
		currencySymbol: 'د.إ',
		currencyPattern: 'AED #,##0.00',
		callToAction: 'احجز الآن',
		socialProof: ['موثوقية', 'جودة عالية', 'خدمة استثنائية'],
		privacyPolicy: 'سياسة الخصوصية',
		termsOfService: 'شروط الخدمة',
		localizedData: {
			symbols: { dollar: 'د.إ', percent: '٪' },
			currency: 'AED',
			valueType: 'mediumAmount' as const,
			preferredSource: 'international' as const,
			conversionRate: 1,
			value: [1, 5000]
		},
		'localizationEnabled': true,
		'deepLocalization': false,
		'strictValidation': true,
		'explicitValidation': true,
		'strictConsistency': true,
		'explicitConsistency': true,
		'strictAccuracy': true,
		'explicitAccuracy': true
	},

	// Malaysia
	my: {
		country: 'Malaysia',
		currency: 'MYR',
		priceRange: [10, 5000],
		timezone: 'Asia/Kuala_Lumpur',
		dateFormat: 'DD/MM/YYYY',
		locale: 'ms-MY',
		currencySymbol: 'RM',
		currencyPattern: 'RM #,##0.00',
		callToAction: 'Beli Sekarang',
		socialProof: ['Kualiti Terjamin', 'Lulus Sijil Halal', 'Popular di Malaysia'],
		privacyPolicy: 'Dasar Privasi',
		termsOfService: 'Terma Perkhidmatan',
		localizedData: {
			currency: 'MYR',
			valueType: 'mediumAmount' as const,
			preferredSource: 'regional' as const,
			'translationEnabled': true,
			'contentStrategy': 'business-first' as const,
			'businessFirst': true,
			'referenceAvailable': true,
			'sourcePriority': ['Official Documents', 'Industry Reports', 'Business Directories'],
			repaymentPeriod: ['30', '60', '90', '120'],
			conversionRate: 1,
			value: [10, 5000]
		},
		'localizationEnabled': true,
		'deepLocalization': true,
		'strictValidation': true,
		'explicitValidation': true,
		'strictConsistency': true,
		'explicitConsistency': true,
		'strictAccuracy': true,
		'explicitAccuracy': true
	},

	// Indonesia
	id: {
		country: 'Indonesia',
		currency: 'IDR',
		priceRange: [100000, 50000000],
		timezone: 'Asia/Jakarta',
		dateFormat: 'DD/MM/YYYY',
		locale: 'id-ID',
		currencySymbol: 'Rp',
		currencyPattern: 'Rp #,##0',
		callToAction: 'Beli Sekarang',
		socialProof: ['Terpercaya', 'Lengkap', 'Harga Terbaik'],
		privacyPolicy: 'Kebijakan Privasi',
		termsOfService: 'Syarat dan Ketentuan',
		localizedData: {
			currency: 'IDR',
			valueType: 'largeAmount' as const,
			preferredSource: 'local' as const,
			'translationEnabled': true,
			'contentStrategy': 'local-first' as const,
			'localFirst': true,
			'referenceAvailable': true,
			'sourcePriority': ['Kementerian/Lembaga', 'Asosiasi', 'Mahasiswa'],
			repaymentPeriod: ['15', '30', '45', '60'],
			conversionRate: 1,
			value: [100000, 50000000]
		},
		'localizationEnabled': true,
		'deepLocalization': true,
		'strictValidation': true,
		'explicitValidation': true,
		'strictConsistency': true,
		'explicitConsistency': true,
		'strictAccuracy': true,
		'explicitAccuracy': true
	},

	// Turkey
	tr: {
		country: 'Turkey',
		currency: 'TRY',
		priceRange: [100, 100000],
		timezone: 'Europe/Istanbul',
		dateFormat: 'DD.MM.YYYY',
		locale: 'tr-TR',
		currencySymbol: '₺',
		currencyPattern: '₺ #,##0.00',
		callToAction: 'Satın Al',
		socialProof: ['Güvenilir', 'Yüksek Kalite', 'Türk Üretimi'],
		privacyPolicy: 'Gizlilik Politikası',
		termsOfService: 'Hizmet Şartları',
		localizedData: {
			currency: 'TRY',
			valueType: 'mediumAmount' as const,
			preferredSource: 'regional' as const,
			'translationEnabled': true,
			'contentStrategy': 'bilingual' as const,
			'bilingual': true,
			'referenceAvailable': true,
			'sourcePriority': ['TSE', 'MyDin', 'GIMDES'],
			repaymentPeriod: ['7', '10', '15', '30'],
			conversionRate: 1,
			value: [100, 100000]
		},
		'localizationEnabled': true,
		'deepLocalization': false,
		'strictValidation': true,
		'explicitValidation': true,
		'strictConsistency': true,
		'explicitConsistency': true,
		'strictAccuracy': true,
		'explicitAccuracy': true
	},

	// United States (default)
	us: {
		country: 'United States',
		currency: 'USD',
		priceRange: [5, 10000],
		timezone: 'America/New_York',
		dateFormat: 'MM/DD/YYYY',
		locale: 'en-US',
		currencySymbol: '$',
		currencyPattern: '$ #,##0.00',
		callToAction: 'Buy Now',
		socialProof: ['Trusted', 'Quality Assured', ' Verified'],
		privacyPolicy: 'Privacy Policy',
		termsOfService: 'Terms of Service',
		localizedData: {
			currency: 'USD',
			valueType: 'mediumAmount' as const,
			preferredSource: 'standard' as const,
			'translationEnabled': false,
			'contentStrategy': 'global' as const,
			'contentStrategy': 'global',
			'referenceAvailable': true,
			'sourcePriority': ['Industry Standards', 'Academic', 'Research Reports'],
			repaymentPeriod: ['30', '60', '90', '180'],
			conversionRate: 1,
			value: [5, 10000]
		},
		'localizationEnabled': true,
		'deepLocalization': false,
		'strictValidation': true,
		'explicitValidation': true,
		'strictConsistency': true,
		'explicitConsistency': true,
		'strictAccuracy': true,
		'explicitAccuracy': true
	}
};

// ==================== Localized SEO Metadata ====================

function getLocalizedSEO(content: any, locale: string = 'en'): {
	title: string;
	description: string;
	keywords: string[];
	ogTitle: string;
	ogDescription: string;
	twitterTitle: string;
	twitterDescription: string;
	language: string;
} {
	const localizedMetadata: Record<string, any> = {
		en: {
			title: 'HalalNeo - Your Trusted Halal Partner',
			description: 'Connect with certified halal suppliers and products worldwide',
			keywords: ['halal', 'certified', 'supplier', 'product'],
			ogTitle: 'HalalNeo - Trusted Halal Partner',
			ogDescription: 'Find verified halal suppliers and products',
			twitterTitle: 'HalalNeo: Trusted Halal Partner',
			twitterDescription: 'Connect with certified halal suppliers globally'
		},
		ar: {
			title: 'هلال نيو - شريكك الموثوق فيه للحلال',
			description: 'تواصل مع الموردين والمنتجات الحلال المعتمدة في جميع أنحاء العالم',
			keywords: ['حلال', 'معتمد', 'مورد', 'منتج'],
			ogTitle: 'هلال نيو - شريكك الموثوق في الحلال',
			ogDescription: 'ابحث عن موردين ومنتجات حلال موثوقة',
			twitterTitle: 'هلال نيو: شريك حلال موثوق',
			twitterDescription: 'تواصل مع الموردين المعتمدين نصًا على الحلال'
		},
		id: {
			title: 'HalalNeo - Mitra Halal Terpercaya Anda',
			description: 'Terhubung dengan pemasok dan produk halal bersertifikat di seluruh dunia',
			keywords: ['halal', 'bersertifikat', 'pemasok', 'produk'],
			ogTitle: 'HalalNeo - Mitra Halal Terpercaya',
			ogDescription: 'Temukan pemasok dan produk halal yang diverifikasi',
			twitterTitle: 'HalalNeo: Mitra Halal Terpercaya',
			twitterDescription: 'Terhubung dengan pemasok halal bersertifikat di seluruh dunia'
		},
		tr: {
			title: 'HalalNeo - Güvenilir Halal Ortağınız',
			description: 'Dünya genelinde sertifikalı Halal tedarikçiler ve ürünlerle bağlantı kurun',
			keywords: ['helal', 'sertifikalı', 'tedarikçi', 'ürün'],
			ogTitle: 'HalalNeo - Güvenilir Halal Ortağınız',
			ogDescription: 'Doğrulanmış Halal tedarikçiler ve ürünler bulun',
			twitterTitle: 'HalalNeo: Güvenilir Halal Ortağı',
			twitterDescription: 'Dünya genelinde sertifikalı Halal tedarikçiler ile bağlantı kurun'
		},
		ms: {
			title: 'HalalNeo - Rakan Halal Terpercaya Anda',
			description: 'Berkaitan dengan pembekal dan produk Halal bersijil di seluruh dunia',
			keywords: ['halal', 'bersijil', 'pembekal', 'produk'],
			ogTitle: 'HalalNeo - Rakan Halal Terpercaya',
			ogDescription: 'Cari pembekal dan produk Halal yang disahkan',
			twitterTitle: 'HalalNeo: Rakan Halal Terpercaya',
			twitterDescription: 'Berkaitan dengan pembekal Halal bersijil di seluruh dunia'
		},
		zh: {
			title: 'HalalNeo - 您值得信赖的清真合作伙伴',
			description: '与全球认证的清真供应商和产品建立联系',
			keywords: ['清真', '认证', '供应商', '产品'],
			ogTitle: 'HalalNeo - 值得信赖的清真合作伙伴',
			ogDescription: '查找已验证的清真供应商和产品',
			twitterTitle: 'HalalNeo: 值得信赖的清真合作伙伴',
			twitterDescription: '与全球认证的清真供应商建立联系'
		}
	};

	return localizedMetadata[locale] || localizedMetadata.en;
}

// ==================== Export ====================

export type {
	Translation,
	EventLocalization,
	ProductLocalization,
	MarketGuideTranslation,
	RegionalDefaults
};

export {
	LANGUAGE_PRIORITY_MATRIX,
	DEFAULT_CONTENT_LANGUAGE,
	VIDEO_RECORDS,
	LOCALE_PREF,
	CONTENT_META_LANGUAGE,
	containsCulturalMarkers,
	adaptContentTypeForCulture,
	REGIONAL_DEFAULTS,
	getLocalizedSEO
};

export default {
	LANGUAGE_PRIORITY_MATRIX,
	DEFAULT_CONTENT_LANGUAGE,
	VIDEO_RECORDS,
	LOCALE_PREF,
	CONTENT_META_LANGUAGE,
	REGIONAL_DEFAULTS,
	getLocalizedSEO,
	containsCulturalMarkers,
	adaptContentTypeForCulture
};
