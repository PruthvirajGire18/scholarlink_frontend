import apiClient from "./apiClient";

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

export const requestTranslations = async ({
  texts = [],
  targetLang,
  sourceLang = "auto",
  forceRefresh = false
}) => {
  const normalizedTexts = normalizeTexts(texts);
  if (!normalizedTexts.length || !targetLang) {
    return { translations: {}, items: [] };
  }

  const response = await apiClient.post("/i18n/translate", {
    texts: normalizedTexts,
    targetLang,
    sourceLang,
    forceRefresh
  });

  return {
    translations: response.data?.translations || {},
    items: response.data?.items || []
  };
};
