// Maps app language code to browser speech synthesis locale.
export const languageMap = {
  en: "en-US",
  hi: "hi-IN",
  mr: "mr-IN"
};

const translationCache = new Map();

function normalizeLanguageCode(input) {
  const lang = String(input || "en").trim().toLowerCase();
  if (!lang) return "en";
  if (lang.startsWith("hi")) return "hi";
  if (lang.startsWith("mr")) return "mr";
  return "en";
}

function toCacheKey(text, langCode) {
  return `${normalizeLanguageCode(langCode)}::${String(text || "").trim()}`;
}

export function getSelectedText() {
  if (typeof window === "undefined" || typeof window.getSelection !== "function") return "";
  const selected = window.getSelection();
  return String(selected?.toString?.() || "").trim();
}

export function getSpeechLocale(langCode) {
  const normalized = normalizeLanguageCode(langCode);
  return languageMap[normalized] || languageMap.en;
}

export function stopSpeaking() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
}

export function speakText(text, langCode, options = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    throw new Error("Speech synthesis is not supported in this browser.");
  }

  const cleanText = String(text || "").trim();
  if (!cleanText) {
    throw new Error("No text available to speak.");
  }

  const rate = Number.isFinite(options.rate) ? options.rate : 1;
  const pitch = Number.isFinite(options.pitch) ? options.pitch : 1;
  const volume = Number.isFinite(options.volume) ? options.volume : 1;

  // Prevent overlapping audio.
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = getSpeechLocale(langCode);
  utterance.rate = Math.min(Math.max(rate, 0.5), 2);
  utterance.pitch = Math.min(Math.max(pitch, 0), 2);
  utterance.volume = Math.min(Math.max(volume, 0), 1);

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export async function resolveTranslatedText({
  text,
  targetLang,
  translator
}) {
  const cleanText = String(text || "").trim();
  const normalizedLang = normalizeLanguageCode(targetLang);
  if (!cleanText) return "";
  if (normalizedLang === "en") return cleanText;

  const key = toCacheKey(cleanText, normalizedLang);
  if (translationCache.has(key)) {
    return translationCache.get(key);
  }

  const translated = await translator(cleanText, normalizedLang);
  const resolved = String(translated || cleanText).trim() || cleanText;
  translationCache.set(key, resolved);
  return resolved;
}

export function clearSpeechTranslationCache() {
  translationCache.clear();
}

export function normalizeAppLanguage(input) {
  return normalizeLanguageCode(input);
}
