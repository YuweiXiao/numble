import { createContext, useContext, useState, type ReactNode } from 'react';
import { type Language, translations } from './i18n';

interface LanguageContextValue {
  lang: Language;
  t: typeof translations.en;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextValue>(null!);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(
    () => (localStorage.getItem('numble-lang') as Language) || 'en'
  );

  const toggleLang = () => {
    setLang(prev => {
      const next = prev === 'en' ? 'zh' : 'en';
      localStorage.setItem('numble-lang', next);
      return next;
    });
  };

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
