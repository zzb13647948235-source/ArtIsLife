
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('zh');

  // Load language from localStorage if available, with safety check
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('artislife_lang') as Language;
      if (savedLang && ['zh', 'en', 'ja', 'fr', 'es'].includes(savedLang)) {
        setLanguage(savedLang);
      }
    } catch (e) {
      // Ignore storage errors
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    try {
      localStorage.setItem('artislife_lang', lang);
    } catch (e) {
      // Ignore storage errors
    }
  };

  const t = (path: string): string => {
    const keys = path.split('.');
    
    // FIX: Fallback to English if the current language doesn't exist in translations object (e.g. 'ja', 'fr')
    // This prevents "Cannot read properties of undefined" errors.
    const langSource = translations[language as keyof typeof translations] || translations['en'];
    let current: any = langSource;
    
    for (const key of keys) {
      if (current === undefined || current[key] === undefined) {
        // Fallback to English if translation missing for specific key
        let fallback: any = translations['en'];
        for (const fbKey of keys) {
            if (fallback === undefined || fallback[fbKey] === undefined) return path;
            fallback = fallback[fbKey];
        }
        return fallback;
      }
      current = current[key];
    }
    return current as string;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
