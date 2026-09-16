/**
 * Translation Data for Home Page
 * Centralized translation content for Home Page
 */

import type { Translation } from './locale-middleware.js';

export const homeTranslations: Record<string, Translation> = {
  // English
  en: {
    title: 'Halal trade intelligence.',
    description: 'Research certification bodies, verify suppliers, and navigate global halal markets — all in one place.'
  },
  
  // Arabic
  ar: {
    title: 'ذكاء التجارة الحلال.',
    description: 'ابحث عن هيئات الشهادة، وتحقق من الموردين، وتصفح الأسواق العالمية للحلال - كل ذلك في مكان واحد.'
  },
  
  // Indonesian
  id: {
    title: 'Kecerdasan perdagangan halal.',
    description: 'Riset badan sertifikasi, verifikasi pemasok, dan navigasi pasar halal global - semuanya dalam satu tempat.'
  },
  
  // Turkish
  tr: {
    title: 'Helal ticaret zekası.',
    description: 'Sertifikasyon kuruluşlarını araştırın, tedarikçileri doğrulayın ve global helal pazarlarını tek bir yerde keşfedin.'
  },
  
  // Malay
  ms: {
    title: 'Kecerdasan perdagangan halal.',
    description: 'Telusur badan pensijilan, sahkan pembekal, dan jelajahi pasaran halal global - semua dalam satu tempat.'
  },
  
  // Bengali
  bn: {
    title: 'হালাল ব্যবসা বুদ্ধিমত্তা.',
    description: 'সরটিফিকেশন বডি গবেষণা করুন, সরবরাহকারীদের যাচাই করুন এবং গ্লোবাল হালাল বাজার নেভিগেট করুন - সব এক জায়গায়।'
  },
  
  // Urdu
  ur: {
    title: 'حلال تجارت ایونٹیجی اردو',
    description: 'سرٹیفکیشن باڈیز کی تحقیق کریں، سپلائئرز کی تصدیق کریں اور گلوبل حلال مارکیٹوں میں جگہ - ایک ہی جگہ میں।'
  }
};

export function getHomeTranslation(locale: string): Translation {
  return homeTranslations[locale] || homeTranslations.en;
}
