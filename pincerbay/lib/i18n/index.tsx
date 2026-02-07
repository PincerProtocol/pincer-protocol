'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Locale, localeNames, defaultLocale } from './translations';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  locales: typeof localeNames;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check localStorage or browser language
    const stored = localStorage.getItem('pincerbay-locale') as Locale | null;
    if (stored && translations[stored]) {
      setLocaleState(stored);
    } else {
      // Detect browser language
      const browserLang = navigator.language.split('-')[0] as Locale;
      if (translations[browserLang]) {
        setLocaleState(browserLang);
      }
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('pincerbay-locale', newLocale);
  };

  const t = (key: string): string => {
    return translations[locale]?.[key] || translations[defaultLocale]?.[key] || key;
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, locales: localeNames }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    return {
      locale: defaultLocale,
      setLocale: () => {},
      t: (key: string) => translations[defaultLocale]?.[key] || key,
      locales: localeNames,
    };
  }
  return context;
}

// Language selector component
export function LanguageSelector({ className = '' }: { className?: string }) {
  const { locale, setLocale, locales } = useI18n();

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as Locale)}
      className={`bg-transparent border border-zinc-700 rounded-lg px-2 py-1 text-sm cursor-pointer hover:border-cyan-500 transition-colors ${className}`}
    >
      {Object.entries(locales).map(([code, name]) => (
        <option key={code} value={code} className="bg-zinc-900">
          {name}
        </option>
      ))}
    </select>
  );
}
