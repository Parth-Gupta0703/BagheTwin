import React, { createContext, useContext, useState, useCallback } from 'react';
import { en, type TranslationKeys } from './en';
import { hi } from './hi';

export type Locale = 'en' | 'hi';

const translations: Record<Locale, TranslationKeys> = { en, hi };

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationKeys;
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: en,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      const saved = localStorage.getItem('baghetwin-locale');
      if (saved === 'hi' || saved === 'en') return saved;
    } catch {}
    return 'en';
  });

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem('baghetwin-locale', newLocale);
    } catch {}
  }, []);

  const value: I18nContextValue = {
    locale,
    setLocale,
    t: translations[locale],
  };

  return React.createElement(I18nContext.Provider, { value }, children);
}

export function useI18n() {
  return useContext(I18nContext);
}

export { en, hi };
export type { TranslationKeys };
