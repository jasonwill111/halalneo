/**
 * 核心页面多语言翻译数据
 * 基础翻译数据，支持 7 种语言
 */

export interface PageTranslation {
  en: string;
  ar: string;
  tr: string;
  id: string;
  ms: string;
  bn: string;
  ur: string;
}

export interface SemanticTranslation {
  title: PageTranslation;
  description: PageTranslation;
  [key: string]: any;
}

// Keywords payload style translation
const translate = (key: string, value: string) => ({
  en: key === 'keywords' ? 'halal, halal certification, halal suppliers' : value,
  ar: key === 'keywords' ? 'حلال, شهادة حلال, موردين حلال' : value,
  tr: key === 'keywords' ? 'helal, helal sertifikasyon, helal tedarikçiler' : value,
  id: key === 'keywords' ? 'halal, sertifikasi halal, pemasok halal' : value,
  ms: key === 'keywords' ? 'halal, pensijilan halal, pembekal halal' : value,
  bn: key === 'keywords' ? 'হালাল, হালাল সরটোফিকেশন, হালাল সরবরাহদাতা' : value,
  ur: key === 'keywords' ? 'حلال, حلال سرٹیفکیشن, حلال سپلائرز' : value,
});

// Core business content translations
export const businessTranslations: Record<string, SemanticTranslation> = {
  // Hero Section
  'hero.title': {
    en: 'Halal trade intelligence.',
    ar: 'ذكاء التجارة الحلال.',
    tr: 'Helal ticaret zekası.',
    id: 'Kecerdasan perdagangan halal.',
    ms: 'Kecerdasan perdagangan halal.',
    bn: 'হালাল বয়সকা অর্জনের শিক্ষা.',
    ur: 'حلال تجارت ایورجیencing اردو',
  },
  'hero.description': {
    en: 'Research certification bodies, verify suppliers, and navigate global halal markets — all in one place.',
    ar: 'ابحث عن هيئات الشهادة، وتحقق من الموردين، وتصفح الأسواق العالمية للحلال - كل ذلك في مكان واحد.',
    tr: 'Sertifikasyon kuruluşlarını araştırın, tedarikçileri doğrulayın ve global helal pazarlarını tek bir yerde keşfedin.',
    id: 'Riset badan sertifikasi, verifikasi pemasok, dan navigasi pasar halal global - semuanya dalam satu tempat.',
    ms: 'Telusur badan pensijilan, sahkan pembekal, dan jelajahi pasaran halal global - semua dalam satu tempat.',
    bn: 'সরিটিফিকেশন বডি গবেষণা করুন, সরবরাহকারীদে যাতাই করুন এবং গ্লোবাল হালাল বজারে নেভিগেট করুন - সব এক জায়গায়।',
    ur: 'سرٹیفکیشن باڈیز کی تحقیق کریں، سپلائرز کی تصدیق کریں اور گلوبل حلال مارکیٹ میں جاگژ کریں - ہک جگہ میں۔',
  },
  
  // Products
  'products.pageTitle': {
    en: 'Halal Product Database - Verified Suppliers',
    ar: 'قاعدة بيانات المنتجات الحلال - الموردين الموثوقين',
    tr: 'Helal Ürün Veritabanı - Onaylanmış Tedarikçiler',
    id: 'Database Produk Halal - Pemasok Terverifikasi',
    ms: 'Database Produk Halal - Pemasok Teresahih',
    bn: 'হালাল প্রোডাক্ট ডেটাবেস - ভেরিফাইড সারসোর্স',
    ur: 'حلال پروڈکٹ ڈیٹا بیس - تصدیق کردہ سپلائرز',
  },
  'products.searchPlaceholder': {
    en: 'Search halal products by name, category, or certification body',
    ar: 'ابحث عن المنتجات الحلال حسب الاسم أو الفئة أوهيئة الشهادة',
    tr: 'Helal ürünleri ad, kategori veya sertifikasyon kuruluşuna göre arayın',
    id: 'Cari produk halal berdasarkan nama, kategori, atau badan sertifikasi',
    ms: 'Cari produk halal berdasarkan nama, kategori, atau badan pensijilan',
    bn: 'নাম, শ্রেণী, অথবা সরটিফিকেশন বডি অনুযায়ী হালাল পণ্য খুঁজুন',
    ur: 'نام، کیٹیگری، یا سرٹیفکیشن باڈی کے مطابق حلال پروڈکٹ تلاش کریں',
  },
  
  // Suppliers
  'suppliers.pageTitle': {
    en: 'Halal Suppliers Directory - Verified Businesses',
    ar: 'دليل موردين الحلال - الشركات الموثوقة',
    tr: 'Helal Tedarikçiler Rehberi - Onaylanmış İşletmeler',
    id: 'Direktori pemasok Halal - Bisnis Terverifikasi',
    ms: 'Direktori Pemasok Halal - Perniagaan Teteriahi',
    bn: 'হালাল সরবরাহকারী যদদেশতালিকা - ভেরিফাইড বিজনেস',
    ur: 'حلال سپلائرز كلید - تصدیق کردہ کاروبار',
  },
  
  // Market Guides
  'marketGuides.pageTitle': {
    en: 'Halal Market Entry Guides - Regulatory Intelligence',
    ar: 'أدلة دخول الأسواق الحلال - ذكاء تنظيمي',
    tr: 'Helal Pazar Giriş Rehberleri - Düzenleyici Zeka',
    id: 'Panduan Masuk Pasar Halal - Intelijen Regulasi',
    ms: 'Panduan Kemasukan Pasaran Halal - Intelijen Regulasi',
    bn: 'হালাল মার্কেট এন্ট্রি গাইডস - নিয়ন্ত্রক বুদ্ধিমত্তা',
    ur: 'حلال مارکیٹ انٹری گائیڈز - ریگولیٹری انٹیلی جنس',
  },
  
  // SEO Meta Tags (Per Page)
  'meta': {
    'products': {
      title: {
        en: 'Halal Products Database - Global Certified Suppliers & Halal Trade Intelligence',
        ar: 'قاعدة بيانات المنتجات الحلال - موردون معتمدون عالميًا وذكاء التجارة الحلال',
        tr: 'Halal Ürün Veritabanı - Küresel Sertifika Tedarikçiler ve Halal Ticaret Zeka',
        id: 'Database Produk Halal - Pemasok bersertifikat global dan kecerdasan perdagangan halal',
        ms: 'Database Produk Halal - Pemasok Semanjut全球 dan Kecerdasan Perdagangan Halal',
        bn: 'হালাল প্রোডাক্ট ডেটাবেস - বর্গাসমীয় নিশ্চিত সরবরাহকারীদের এবং হালাল বয়স কা অর্জনের শিক্ষা',
        ur: 'حلال پروڈکٹ ڈیٹا بیس - عالمی سرٹیفائیڈ سپلائرز اور حلال ٹریڈ انٹیلی جنس'
      },
      description: {
        en: 'Search verified halal products from certified suppliers worldwide. Filter by category, check certification scope and pricing at a glance.',
        ar: 'ابحث عن المنتجات الحلال الموثوقة من موردين معتمدين حول العالم. تصفية حسب الفئة والتحقق من نطاق الشهادة والأسعار في لمحة.',
        tr: 'Sertifikalı tedarikçilerden küresel ithal sertifikalı ürünleri arayın. Kategoriye göre filtreleyin, sertifika kapsamı ve fiyatları hızla kontrol edin.',
        id: 'Cari produk halal yang terverifikasi dari pemasok bersertifikat di seluruh dunia. Filter berdasarkan kategori, cek cakupan dan harga sertifikasi dalam sekejap.',
        ms: 'Cari produk halal yang disahkan dari pembekal bersijil di seluruh dunia. Tapis mengikut kategori, semak skop dan harga pensijilan dengan mudah.',
        bn: 'সার্টোফাইক করা প্রুর উপায় থেকে হালাল প্রোডাক্টের খাঁজ পান। শ্রেণী অনুযায়ী ফিল্টার, একটি দৃশ্যে সার্টিফিকেশন স্কোপ এবং মূল্য পরীক্ষা করুন।',
        ur: 'تصدیق شدہ حلال پروڈکٹس کو سرٹیفائیڈ سپلائرز سے تلاش کریں۔ کیٹیگری کے مطابق فلٹر کریں، سرٹیفکیشن سکن اور قیمتیں ایک نظر میں چیک کریں۔'
      }
    }
  }
};

// Helper function to get translation for key
export function getTranslation(key: string, locale: string = 'en'): string {
  const keyParts = key.split('.');
  let value: any = businessTranslations;
  
  for (const part of keyParts) {
    value = value[part];
  }
  
  if (typeof value === 'object' && value !== null) {
    return (value as any)[locale] || value['en'];
  }
  
  return String(value);
}

// SEO Meta data helper
export function getSeoMeta(page: string): {
  title: Record<string, string>;
  description: Record<string, string>;
  keywords: Record<string, string>;
} {
  if (businessTranslations.meta[page]) {
    return {
      title: businessTranslations.meta[page].title || {},
      description: businessTranslations.meta[page].description || {},
      keywords: translate('keywords', 'halal, halal certification, halal suppliers'),
    };
  }
  
  return {
    title: {
      en: `${page} | HalalNeo`,
      ar: `${page} | HalalNeo`,
      tr: `${page} | HalalNeo`,
      id: `${page} | HalalNeo`,
      ms: `${page} | HalalNeo`,
      bn: `${page} | HalalNeo`,
      ur: `${page} | HalalNeo`,
    },
    description: {
      en: `Explore ${page} on HalalNeo platform.`,
      ar: `استكشف ${page} على منصة HalalNeo.`,
      tr: `HalalNeo platformunda ${page} keşfedin.`,
      id: `Jelajahi ${page} di platform HalalNeo.`,
      ms: `Terokai ${page} di platform HalalNeo.`,
      bn: `HalalNeo প্লাটফর্মে ${page} অনুসন্ধান করুন।`,
      ur: `HalalNeo پلیٹ فارم پر ${page} دریافت کریں۔`,
    },
    keywords: translate('keywords', 'halal, halal certification, halal suppliers'),
  };
}

// Page titles for common pages
export const pageTitles: Record<string, SemanticTranslation> = {
  'home': businessTranslations['hero.title'],
  'products': businessTranslations['products.pageTitle'],
  'suppliers': businessTranslations['suppliers.pageTitle'],
  'marketGuides': businessTranslations['marketGuides.pageTitle'],
  'about': {
    en: 'About HalalNeo - Trusted Halal Trade Intelligence',
    ar: 'عن HalalNeo - ذكاء التجارة الحلال الموثوق',
    tr: 'HalalNeo Hakkında - Güvenilir Halal Ticaret Zeka',
    id: 'Tentang HalalNeo - Kecerdasan Perdagangan Halal Terpercaya',
    ms: 'Tentang HalalNeo - Kecerdasan Perdagangan Halal Dipercayai',
    bn: 'HalalNeo সম্পর্কে - বিশ্বস্ত হালাল বয়স কা অর্জনের শিক্ষা',
    ur: 'حلال نیو کے بارے میں - بھروسہ مند حلال تجارتی انٹیلی جنس',
  },
  'contact': {
    en: 'Contact HalalNeo - Global Halal Trade Support',
    ar: 'اتصل بـ HalalNeo - دعم التجارة الحلال العالمية',
    tr: 'HalalNeo ile İletişim - Küresel Halal Ticaret Desteği',
    id: 'Hubungi HalalNeo - Dukungan Perdagangan Halal Global',
    ms: 'Hubungi HalalNeo - Sokongan Perdagangan Halal Global',
    bn: 'HalalNeo এর সাথে যোগাযোগ - গ্লোবাল হালাল বয়স কা সাপোর্ট',
    ur: 'حلال نیو سے رابطہ - گلوبل حلال ٹریڈ سپورٹ',
  }
};

// Meta tags helper for all pages
export function generatePageMeta(page: string): {
  title: Record<string, string>;
  description: Record<string, string>;
  ogTitle: Record<string, string>;
  ogDescription: Record<string, string>;
} {
  const titles = pageTitles[page] || businessTranslations['hero.title'];
  
  return {
    title: titles,
    description: businessTranslations['hero.description'],
    ogTitle: {
      en: `HalalNeo - ${titles.en}`,
      ar: `HalalNeo - ${titles.ar}`,
      tr: `HalalNeo - ${titles.tr}`,
      id: `HalalNeo - ${titles.id}`,
      ms: `HalalNeo - ${titles.ms}`,
      bn: `HalalNeo - ${titles.bn}`,
      ur: `HalalNeo - ${titles.ur}`,
    },
    ogDescription: {
      en: businessTranslations['hero.description'].en,
      ar: businessTranslations['hero.description'].ar,
      tr: businessTranslations['hero.description'].tr,
      id: businessTranslations['hero.description'].id,
      ms: businessTranslations['hero.description'].ms,
      bn: businessTranslations['hero.description'].bn,
      ur: businessTranslations['hero.description'].ur,
    }
  };
}

// Quality assurance: verify all translations are populated
export function validateTranslations(): boolean {
  const allKeys = Object.keys(businessTranslations);
  let isValid = true;
  
  for (const key of allKeys) {
    const value = businessTranslations[key];
    if (typeof value === 'object' && value !== null) {
      for (const locale of ['en', 'ar', 'tr', 'id', 'ms', 'bn', 'ur']) {
        if (!value[locale]) {
          console.warn(`Missing translation for ${key}.${locale}`);
          isValid = false;
        }
      }
    }
  }
  
  return isValid;
}

// Override translations for specific contexts
export function overrideTranslations(context: string, overrides: Record<string, string>) {
  if (context) {
    // Would implement in production
    console.log(`Override translations for ${context}`, overrides);
  }
}

// Apply translations to page content
export function applyTranslations(content: string, locale: string = 'en'): string {
  // In production, would replace all translation keys with actual translated content
  return content;
}

// Export helper for SvelteKit
export default {
  getTranslation,
  getSeoMeta,
  generatePageMeta,
  pageTitles,
  businessTranslations,
  validateTranslations,
};
