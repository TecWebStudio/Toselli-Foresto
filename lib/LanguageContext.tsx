'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { translate, type LangCode, DEFAULT_LANG } from '@/lib/i18n';
import { useAuth } from '@/lib/AuthContext';

interface LanguageContextType {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: DEFAULT_LANG,
  setLang: () => {},
  t: (key) => key,
});

const LANG_STORAGE_KEY = 'devhub_lang';

const VALID_LANGS: LangCode[] = ['it', 'en', 'es', 'fr', 'de', 'pt'];
function isValidLang(v: unknown): v is LangCode {
  return typeof v === 'string' && VALID_LANGS.includes(v as LangCode);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // Initialise from localStorage (instant, avoids flash), then sync from user record
  const [lang, setLangState] = useState<LangCode>(() => {
    if (typeof window === 'undefined') return DEFAULT_LANG;
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    return isValidLang(stored) ? stored : DEFAULT_LANG;
  });

  // When auth user loads / changes, sync language from user record
  useEffect(() => {
    if (user?.language && isValidLang(user.language) && user.language !== lang) {
      setLangState(user.language as LangCode);
      localStorage.setItem(LANG_STORAGE_KEY, user.language);
      document.documentElement.lang = user.language;
    }
  }, [user?.language]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync html[lang] attribute whenever lang changes
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((newLang: LangCode) => {
    setLangState(newLang);
    localStorage.setItem(LANG_STORAGE_KEY, newLang);
    document.documentElement.lang = newLang;
  }, []);

  const t = useCallback((key: string) => translate(key, lang), [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
