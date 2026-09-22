import { getLocales } from 'expo-localization';
import * as Updates from 'expo-updates';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DevSettings, I18nManager } from 'react-native';

import { storage } from '@/lib/storage';

import { fallbackLanguage, type Language, resources } from './resources';

export { languages, type Language } from './resources';

const LANGUAGE_KEY = 'language';

const isSupported = (code: string | null | undefined): code is Language =>
  !!code && code in resources;

/** The user's explicit choice, or null to follow the device. */
export function getLanguagePreference(): Language | null {
  const stored = storage.getString(LANGUAGE_KEY);
  return isSupported(stored) ? stored : null;
}

function deviceLanguage(): Language {
  const match = getLocales().find((l) => isSupported(l.languageCode));
  return (match?.languageCode as Language | undefined) ?? fallbackLanguage;
}

export const isRTL = (lang: string) => i18n.dir(lang) === 'rtl';

i18n.use(initReactI18next).init({
  resources,
  lng: getLanguagePreference() ?? deviceLanguage(),
  fallbackLng: fallbackLanguage,
  interpolation: { escapeValue: false },
  returnNull: false,
});

const RTL_RELOAD_KEY = 'i18n.rtlReloadedFor';

function reloadApp() {
  if (__DEV__) DevSettings.reload();
  else Updates.reloadAsync();
}

/**
 * Native layout direction is read when the React root starts, so a change needs a reload.
 * On launch, if the stored direction doesn't match the language (first launch on an RTL
 * device, or the device language changed), fix it and reload once.
 */
function syncLayoutDirection() {
  const rtl = isRTL(i18n.language);
  if (I18nManager.isRTL === rtl) {
    storage.remove(RTL_RELOAD_KEY);
    return;
  }
  I18nManager.allowRTL(rtl);
  I18nManager.forceRTL(rtl);
  const target = rtl ? 'rtl' : 'ltr';
  if (storage.getString(RTL_RELOAD_KEY) === target) return; // already tried, avoid loops
  storage.set(RTL_RELOAD_KEY, target);
  setTimeout(reloadApp, 0);
}

syncLayoutDirection();

/**
 * Change language (null = follow device). Returns true when the app is about to reload
 * because the text direction flipped.
 */
export async function setLanguage(lang: Language | null): Promise<boolean> {
  if (lang) storage.set(LANGUAGE_KEY, lang);
  else storage.remove(LANGUAGE_KEY);

  const next = lang ?? deviceLanguage();
  await i18n.changeLanguage(next);

  const rtl = isRTL(next);
  if (I18nManager.isRTL === rtl) return false;

  I18nManager.allowRTL(rtl);
  I18nManager.forceRTL(rtl);
  reloadApp();
  return true;
}

/** Locale-aware formatting helpers (Hermes ships Intl). */
export const format = {
  number: (value: number, options?: Intl.NumberFormatOptions) =>
    new Intl.NumberFormat(i18n.language, options).format(value),
  currency: (value: number, currency: string) =>
    new Intl.NumberFormat(i18n.language, { style: 'currency', currency }).format(value),
  date: (value: Date | string | number, options?: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(i18n.language, options ?? { dateStyle: 'medium' }).format(
      new Date(value),
    ),
  relative: (value: number, unit: Intl.RelativeTimeFormatUnit) =>
    new Intl.RelativeTimeFormat(i18n.language, { numeric: 'auto' }).format(value, unit),
};

export default i18n;
