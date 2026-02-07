import { useCallback, useEffect, useMemo, useState } from "react";
import { translations, type Language } from "./translations";

const FALLBACK_LANGUAGE: Language = "en";
let currentLanguage: Language = "hu";
const listeners = new Set<(lang: Language) => void>();

type Params = Record<string, string | number>;

export function t(key: string, langOverride?: Language | Params, params?: Params): string {
  const resolvedParams = typeof langOverride === "object" ? langOverride : params;
  const lang = typeof langOverride === "string" ? langOverride : currentLanguage;
  const table = translations[lang] ?? translations[FALLBACK_LANGUAGE];
  const fallback = translations[FALLBACK_LANGUAGE];
  const raw = table[key] ?? fallback[key] ?? key;
  if(!resolvedParams) return raw;
  return raw.replace(/\{\{(\w+)\}\}/g, (_, token) => String(resolvedParams[token] ?? ""));
}

export function getI18nLanguage(): Language {
  return currentLanguage;
}

export function setI18nLanguage(lang: Language): void {
  if(lang === currentLanguage) return;
  currentLanguage = lang;
  for(const listener of listeners){
    listener(lang);
  }
}

export function onI18nChange(listener: (lang: Language) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

type UseI18nOptions = {
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
};

export function useI18n(options: UseI18nOptions = {}){
  const { language, onLanguageChange } = options;
  const [internalLang, setInternalLang] = useState<Language>(language ?? getI18nLanguage());
  const lang = language ?? internalLang;

  useEffect(() => {
    setI18nLanguage(lang);
  }, [lang]);

  const setLang = useCallback((next: Language) => {
    if(language){
      onLanguageChange?.(next);
      return;
    }
    setInternalLang(next);
    onLanguageChange?.(next);
  }, [language, onLanguageChange]);

  const translate = useMemo(() => {
    return (key: string, params?: Params) => t(key, lang, params);
  }, [lang]);

  return { lang, setLang, t: translate };
}
