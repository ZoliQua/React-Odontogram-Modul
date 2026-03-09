import { useCallback, useEffect, useMemo, useState } from "react";
import { translations, type Language } from "./translations";

const FALLBACK_LANGUAGE: Language = "en";
let currentLanguage: Language = "hu";
const listeners = new Set<(lang: Language) => void>();

/** Parameter map for template placeholders (`{{key}}`). */
type Params = Record<string, string | number>;

/**
 * Resolve a translation key to a localised string.
 *
 * @param key - Dot-delimited translation key (e.g. `"app.title"`).
 * @param langOverride - Explicit {@link Language} code **or** a {@link Params} object
 *   (when called with two arguments where the second is an object, it is treated as params).
 * @param params - Optional template parameters that replace `{{placeholder}}` tokens.
 * @returns The resolved string, or the key itself if no translation is found.
 */
export function t(key: string, langOverride?: Language | Params, params?: Params): string {
  const resolvedParams = typeof langOverride === "object" ? langOverride : params;
  const lang = typeof langOverride === "string" ? langOverride : currentLanguage;
  const table = translations[lang] ?? translations[FALLBACK_LANGUAGE];
  const fallback = translations[FALLBACK_LANGUAGE];
  const raw = table[key] ?? fallback[key] ?? key;
  if(!resolvedParams) return raw;
  return raw.replace(/\{\{(\w+)\}\}/g, (_, token) => String(resolvedParams[token] ?? ""));
}

/** Get the current global language. */
export function getI18nLanguage(): Language {
  return currentLanguage;
}

/** Set the global language and notify all listeners. No-op if the language is unchanged. */
export function setI18nLanguage(lang: Language): void {
  if(lang === currentLanguage) return;
  currentLanguage = lang;
  for(const listener of listeners){
    listener(lang);
  }
}

/**
 * Subscribe to language changes.
 * @returns An unsubscribe function.
 */
export function onI18nChange(listener: (lang: Language) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

type UseI18nOptions = {
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
};

/**
 * React hook for i18n. Supports both **controlled** mode (parent provides
 * `language` prop) and **standalone** mode (internal state).
 *
 * @param options - Optional controlled-mode props.
 * @returns `{ lang, setLang, t }` — current language, setter, and scoped translate function.
 */
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
