import { createContext, useContext, useState, useCallback, useMemo } from "react";
import en from "./locales/en.json";
import hi from "./locales/hi.json";
import mr from "./locales/mr.json";

const STORAGE_KEY = "app_lang";
const DEFAULT_LANG = "en";

const translations = { en, hi, mr };

const LanguageContext = createContext(null);

function getStoredLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && translations[stored]) return stored;
  } catch (_) {}
  return DEFAULT_LANG;
}

function getNested(obj, path) {
  const keys = path.split(".");
  let current = obj;
  for (const key of keys) {
    if (current == null || typeof current !== "object") return undefined;
    current = current[key];
  }
  return current;
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => getStoredLanguage());

  const setLanguage = useCallback((newLang) => {
    if (!translations[newLang]) return;
    setLangState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch (_) {}
  }, []);

  const t = useCallback(
    (key) => {
      const current = translations[lang] || en;
      const value = getNested(current, key);
      if (value !== undefined) return value;
      return getNested(en, key) ?? key;
    },
    [lang]
  );

  const value = useMemo(
    () => ({
      lang,
      setLanguage,
      t,
      isRTL: false,
    }),
    [lang, setLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

export function useTranslation() {
  const { t, lang, setLanguage } = useLanguage();
  return { t, lang, setLanguage };
}

export default LanguageContext;
