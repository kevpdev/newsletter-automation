export type SupportedLocale = 'en' | 'fr';

interface Translations {
  noArticlesThisWeek: string;
  checkBackNextWeek: string;
  techDigest: string;
  articlesScored: string;
  criticalUpdates: string;
  importantUpdates: string;
  bonusReads: string;
  poweredBy: string;
  source: string;
  week: string;
  topThisWeek: string;
}

const translations: Record<SupportedLocale, Translations> = {
  en: {
    noArticlesThisWeek: 'No articles this week',
    checkBackNextWeek: 'Check back next week for updates!',
    techDigest: 'Tech Digest',
    articlesScored: 'articles scored and curated',
    criticalUpdates: '🔥 Critical Updates (Must Read)',
    importantUpdates: '📌 Important Updates',
    bonusReads: '💡 Bonus Reads',
    poweredBy: 'Tech Digest · Powered by FreshRSS + Claude 3.5 Haiku',
    source: 'Source',
    week: 'Week',
    topThisWeek: '📋 Top 3 This Week',
  },
  fr: {
    noArticlesThisWeek: 'Aucun article cette semaine',
    checkBackNextWeek: 'Revenez la semaine prochaine pour des mises à jour !',
    techDigest: 'Digest Tech',
    articlesScored: 'articles notés et sélectionnés',
    criticalUpdates: '🔥 Mises à jour critiques (À lire)',
    importantUpdates: '📌 Mises à jour importantes',
    bonusReads: '💡 Lectures bonus',
    poweredBy: 'Digest Tech · Propulsé par FreshRSS + Claude 3.5 Haiku',
    source: 'Source',
    week: 'Semaine',
    topThisWeek: '📋 Top 3 de la semaine',
  },
};

export function getTranslations(locale?: string): Translations {
  const normalizedLocale = (locale?.toLowerCase().startsWith('fr') ? 'fr' : 'en') as SupportedLocale;
  return translations[normalizedLocale];
}

export function getLocale(): SupportedLocale {
  const locale = process.env.LOCALE || 'en';
  return (locale.toLowerCase().startsWith('fr') ? 'fr' : 'en') as SupportedLocale;
}
