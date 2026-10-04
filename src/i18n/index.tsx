import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  SupportedLanguage,
  LanguageInfo,
  LANGUAGES,
  TranslationDictionary,
  I18nContextType,
} from '../types/i18n';
import { en } from './locales/en';
import { tl } from './locales/tl';
import { ceb } from './locales/ceb';
import { ja } from './locales/ja';
import { zh } from './locales/zh';
import { vi } from './locales/vi';

export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  en,
  tl,
  ceb,
  ja,
  zh,
  vi,
};

export const STORAGE_KEY = 'lovejaz_lang';

export function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{\{\s*(\w+)\s*\}\}|\{\s*(\w+)\s*\}/g, (match, p1, p2) => {
    const key = p1 || p2;
    return key in params ? String(params[key]) : match;
  });
}

export function translate(
  lang: SupportedLanguage,
  key: string,
  params?: Record<string, string | number>
): string {
  const dict = translations[lang] || translations.en;
  let text = dict[key];
  if (text === undefined) {
    text = translations.en[key];
  }
  if (text === undefined) {
    return key;
  }
  return interpolate(text, params);
}

const I18nContext = createContext<I18nContextType>({
  currentLanguage: 'en',
  setLanguage: () => {},
  t: (key: string, params?: Record<string, string | number>) => translate('en', key, params),
  LANGUAGES,
});

export interface I18nProviderProps {
  children?: React.ReactNode;
  initialLanguage?: SupportedLanguage;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children, initialLanguage }) => {
  const [currentLanguage, setCurrentLanguageState] = useState<SupportedLanguage>(() => {
    if (initialLanguage && (initialLanguage in translations)) {
      return initialLanguage;
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
        if (saved && (saved in translations)) {
          return saved;
        }
      } catch {
        // Fallback safely if localStorage is not accessible
      }
    }
    return 'en';
  });

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    if (lang in translations) {
      setCurrentLanguageState(lang);
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.setItem(STORAGE_KEY, lang);
        } catch {
          // Fallback safely if localStorage is not accessible
        }
      }
    }
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      return translate(currentLanguage, key, params);
    },
    [currentLanguage]
  );

  const value = useMemo<I18nContextType>(
    () => ({
      currentLanguage,
      setLanguage,
      t,
      LANGUAGES,
    }),
    [currentLanguage, setLanguage, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  return context;
}

export { LANGUAGES };
export type { SupportedLanguage, LanguageInfo, TranslationDictionary, I18nContextType };
