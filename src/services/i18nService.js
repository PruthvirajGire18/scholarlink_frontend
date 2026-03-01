import apiClient from "./apiClient";

const translationCache = new Map();
const inFlightTranslations = new Map();
const TRANSLATION_CONCURRENCY = 4;
const TRANSLATION_COOLDOWN_MS = 15 * 1000;

let serviceCooldownUntil = 0;
let hasLoggedProviderError = false;

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

async function runWithConcurrency(values, limit, worker) {
  const safeLimit = Math.max(1, Math.min(limit, values.length || 1));
  const results = new Array(values.length);
  let cursor = 0;

  const runners = Array.from({ length: safeLimit }, async () => {
    while (true) {
      const currentIndex = cursor++;
      if (currentIndex >= values.length) return;
      results[currentIndex] = await worker(values[currentIndex], currentIndex);
    }
  });

  await Promise.all(runners);
  return results;
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

  const rows = await runWithConcurrency(normalizedTexts, TRANSLATION_CONCURRENCY, async (text) => {
    if (normalizedLang === "en") {
      return { originalText: text, translatedText: text, provider: "identity" };
    }

    const cached = !forceRefresh ? getFromCache(text, normalizedLang) : null;
    if (cached) {
      return { originalText: text, translatedText: cached, provider: "cache" };
    }

    const translated = await translateText({ text, targetLang: normalizedLang, sourceLang });
    // Avoid poisoning cache with "identity fallback" when provider is down.
    if (translated && translated !== text) {
      saveToCache(text, normalizedLang, translated);
    }
    return {
      originalText: text,
      translatedText: translated,
      provider: translated !== text ? "gemini" : "identity"
    };
  });

  const translations = {};
  rows.forEach((row) => {
    translations[row.originalText] = row.translatedText;
  });

  return {
    translations,
    items: rows
  };
};

export const translateText = async ({ text, targetLang, sourceLang = "auto" }) => {
  const normalizedText = String(text || "").trim();
  const normalizedLang = normalizeLanguage(targetLang);
  const normalizedSourceLang = String(sourceLang || "auto").trim().toLowerCase() || "auto";
  if (!normalizedText) return "";
  if (!normalizedLang || normalizedLang === "en") return normalizedText;

  const cacheKey = toCacheKey(normalizedText, normalizedLang);
  const runningRequest = inFlightTranslations.get(cacheKey);
  if (runningRequest) {
    return runningRequest;
  }

  if (Date.now() < serviceCooldownUntil) {
    return normalizedText;
  }

  const request = apiClient
    .post("/translate", {
      text: normalizedText,
      targetLang: normalizedLang,
      sourceLang: normalizedSourceLang
    })
    .then((response) => {
      serviceCooldownUntil = 0;
      hasLoggedProviderError = false;
      return String(response.data?.translated || normalizedText).trim() || normalizedText;
    })
    .catch((error) => {
      serviceCooldownUntil = Date.now() + TRANSLATION_COOLDOWN_MS;
      if (!hasLoggedProviderError) {
        hasLoggedProviderError = true;
        // Log once to aid debugging, then stay quiet to avoid console spam.
        console.warn("Translation provider unavailable, using original text.", error?.message || error);
      }
      return normalizedText;
    })
    .finally(() => {
      inFlightTranslations.delete(cacheKey);
    });

  inFlightTranslations.set(cacheKey, request);
  return request;
};
