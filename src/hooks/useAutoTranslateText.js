import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "../i18n";
import { requestTranslations } from "../services/i18nService";

const cache = new Map();
const DEVANAGARI_REGEX = /[\u0900-\u097F]/;

function normalizeText(text) {
  return String(text || "").trim();
}

function buildKey(sourceLang, targetLang, text) {
  return `${sourceLang}::${targetLang}::${text}`;
}

function isAlreadyInTargetScript(targetLang, text) {
  if (!text) return false;
  if (targetLang === "hi" || targetLang === "mr") {
    return DEVANAGARI_REGEX.test(text);
  }
  return false;
}

export default function useAutoTranslateText(text, options = {}) {
  const { lang } = useTranslation();
  const sourceLang = String(options.sourceLang || "auto").trim().toLowerCase();
  const originalText = useMemo(() => normalizeText(text), [text]);
  const [translatedText, setTranslatedText] = useState(originalText);

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (!originalText) {
        if (active) setTranslatedText("");
        return;
      }

      const sameLanguage = sourceLang !== "auto" && lang === sourceLang;
      if (sameLanguage || isAlreadyInTargetScript(lang, originalText)) {
        if (active) setTranslatedText(originalText);
        return;
      }

      const key = buildKey(sourceLang, lang, originalText);
      if (cache.has(key)) {
        if (active) setTranslatedText(cache.get(key));
        return;
      }

      if (active) setTranslatedText(originalText);

      try {
        const response = await requestTranslations({
          texts: [originalText],
          targetLang: lang,
          sourceLang
        });
        const resolved = response.translations?.[originalText] || originalText;
        cache.set(key, resolved);
        if (active) setTranslatedText(resolved);
      } catch {
        if (active) setTranslatedText(originalText);
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [originalText, lang, sourceLang]);

  return translatedText || originalText;
}
