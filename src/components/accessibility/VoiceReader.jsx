import { useState, useRef, useEffect } from "react";
import { useTranslation } from "../../i18n";
import { langToSpeechCode } from "../../i18n/languages";

const hasSpeech = typeof window !== "undefined" && "speechSynthesis" in window;

export default function VoiceReader({ text, label, className = "" }) {
  const { t, lang } = useTranslation();
  const [status, setStatus] = useState("idle"); // idle | playing | paused
  const utteranceRef = useRef(null);
  const synthRef = useRef(null);

  const speechLang = langToSpeechCode[lang] || "en-IN";

  useEffect(() => {
    if (!hasSpeech) return;
    synthRef.current = window.speechSynthesis;
    return () => {
      if (utteranceRef.current) {
        try {
          window.speechSynthesis.cancel();
        } catch (_) {}
      }
    };
  }, []);

  const play = () => {
    if (!hasSpeech || !text || typeof text !== "string") return;
    const s = synthRef.current;
    if (!s) return;
    s.cancel();
    const u = new SpeechSynthesisUtterance(text.trim());
    u.lang = speechLang;
    u.rate = 0.95;
    u.onstart = () => setStatus("playing");
    u.onend = () => setStatus("idle");
    u.onerror = () => setStatus("idle");
    utteranceRef.current = u;
    s.speak(u);
  };

  const pause = () => {
    if (!hasSpeech) return;
    window.speechSynthesis.pause();
    setStatus("paused");
  };

  const resume = () => {
    if (!hasSpeech) return;
    window.speechSynthesis.resume();
    setStatus("playing");
  };

  const stop = () => {
    if (!hasSpeech) return;
    window.speechSynthesis.cancel();
    setStatus("idle");
  };

  if (!hasSpeech) return null;

  const ariaLabel =
    label ||
    (status === "playing"
      ? t("common.pause")
      : status === "paused"
        ? t("common.play")
        : t("common.readAloud"));

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50/80 p-1 ${className}`}
      role="group"
      aria-label={t("common.readAloud")}
    >
      {status === "idle" && (
        <button
          type="button"
          onClick={play}
          className="rounded p-1.5 text-slate-600 transition hover:bg-teal-100 hover:text-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-600"
          aria-label={t("common.play")}
          title={t("common.play")}
        >
          <span aria-hidden="true">▶</span>
        </button>
      )}
      {(status === "playing" || status === "paused") && (
        <>
          <button
            type="button"
            onClick={status === "playing" ? pause : resume}
            className="rounded p-1.5 text-slate-600 transition hover:bg-teal-100 hover:text-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-600"
            aria-label={status === "playing" ? t("common.pause") : t("common.play")}
            title={status === "playing" ? t("common.pause") : t("common.play")}
          >
            <span aria-hidden="true">{status === "playing" ? "⏸" : "▶"}</span>
          </button>
          <button
            type="button"
            onClick={stop}
            className="rounded p-1.5 text-slate-600 transition hover:bg-red-100 hover:text-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-red-500"
            aria-label={t("common.stop")}
            title={t("common.stop")}
          >
            <span aria-hidden="true">⏹</span>
          </button>
        </>
      )}
    </div>
  );
}
