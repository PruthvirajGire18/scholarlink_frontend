import { langToSpeechCode } from "../i18n/languages";

const hasSpeech = typeof window !== "undefined" && "speechSynthesis" in window;

let lastHintTime = 0;
const THROTTLE_MS = 2000;

export function speakHint(text, langCode = "en") {
  if (!hasSpeech || !text) return;
  const now = Date.now();
  if (now - lastHintTime < THROTTLE_MS) return;
  lastHintTime = now;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(String(text).trim());
  u.lang = langToSpeechCode[langCode] || "en-IN";
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}
