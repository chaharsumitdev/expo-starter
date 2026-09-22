import ar from '@/locales/ar/translation.json';
import en from '@/locales/en/translation.json';

/**
 * Add a language: create src/locales/<code>/translation.json (+ native.json for the app name),
 * register it here, and add it to `locales` / `supportedLocales` in app.config.ts.
 */
export const resources = {
  en: { translation: en },
  ar: { translation: ar },
} as const;

export const languages = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
] as const satisfies { code: keyof typeof resources; label: string }[];

export type Language = keyof typeof resources;
export const fallbackLanguage: Language = 'en';
