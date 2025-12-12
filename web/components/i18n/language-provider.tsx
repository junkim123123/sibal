'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Language, translations } from '@/lib/i18n/translations';

type LanguageProviderState = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
};

const initialState: LanguageProviderState = {
  language: 'en',
  setLanguage: () => null,
  t: translations.en,
};

const LanguageProviderContext = createContext<LanguageProviderState>(initialState);

export function LanguageProvider({
  children,
  defaultLanguage = 'en',
  storageKey = 'nexsupply-language',
}: {
  children: React.ReactNode;
  defaultLanguage?: Language;
  storageKey?: string;
}) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load language from localStorage
    const stored = localStorage.getItem(storageKey) as Language | null;
    if (stored && (stored === 'en' || stored === 'ko')) {
      setLanguageState(stored);
    }
  }, [storageKey]);

  const setLanguage = (lang: Language) => {
    localStorage.setItem(storageKey, lang);
    setLanguageState(lang);
  };

  // Ensure we always have a valid translation object
  const currentTranslation = translations[language] || translations.en;
  
  const value = {
    language,
    setLanguage,
    t: currentTranslation,
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <LanguageProviderContext.Provider value={value}>
      {children}
    </LanguageProviderContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageProviderContext);

  if (context === undefined)
    throw new Error('useLanguage must be used within a LanguageProvider');

  return context;
};

