import apiClient from "./apiClient";

const translationCache = new Map();

function normalizeTexts(texts = []) {
  if (!Array.isArray(texts)) return [];
  const seen = new Set();
  const result = [];
  texts.forEach((value) => {
    const text = String(value || "").trim();
    if (!text) return;
    if (seen.has(text)) return;
    seen.add(text);
    result.push(text);
  });
  return result;
}

function normalizeLanguage(input) {
  const value = String(input || "en").trim().toLowerCase();
  if (!value) return "en";
  if (value.startsWith("hi")) return "hi";
  if (value.startsWith("mr")) return "mr";
  return "en";
}

function toCacheKey(text, langCode) {
  return `${normalizeLanguage(langCode)}::${String(text || "").trim()}`;
}

function getFromCache(text, langCode) {
  const key = toCacheKey(text, langCode);
  return translationCache.get(key);
}

function saveToCache(text, langCode, translated) {
  const key = toCacheKey(text, langCode);
  translationCache.set(key, translated);
}

export const requestTranslations = async ({
  texts = [],
  targetLang,
  sourceLang = "auto",
  forceRefresh = false
}) => {
  const normalizedTexts = normalizeTexts(texts);
  const normalizedLang = normalizeLanguage(targetLang);
  if (!normalizedTexts.length || !normalizedLang) {
    return { translations: {}, items: [] };
  }

  const translations = {};
  const items = [];

  for (const text of normalizedTexts) {
    if (normalizedLang === "en") {
      translations[text] = text;
      items.push({ originalText: text, translatedText: text, provider: "identity" });
      continue;
    }

    const cached = !forceRefresh ? getFromCache(text, normalizedLang) : null;
    if (cached) {
      translations[text] = cached;
      items.push({ originalText: text, translatedText: cached, provider: "cache" });
      continue;
    }

    const translated = await translateText({ text, targetLang: normalizedLang, sourceLang });
    translations[text] = translated;
    saveToCache(text, normalizedLang, translated);
    items.push({ originalText: text, translatedText: translated, provider: "gemini" });
  }

  return {
    translations,
    items
  };
};

export const translateText = async ({ text, targetLang, sourceLang = "auto" }) => {
  const normalizedText = String(text || "").trim();
  const normalizedLang = normalizeLanguage(targetLang);
  const normalizedSourceLang = String(sourceLang || "auto").trim().toLowerCase() || "auto";
  if (!normalizedText) return "";
  if (!normalizedLang || normalizedLang === "en") return normalizedText;

  const response = await apiClient.post("/translate", {
    text: normalizedText,
    targetLang: normalizedLang,
    sourceLang: normalizedSourceLang
  });
  return String(response.data?.translated || normalizedText).trim() || normalizedText;
};
