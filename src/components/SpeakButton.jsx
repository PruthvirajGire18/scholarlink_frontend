import { useEffect, useMemo, useState } from "react";
import useResolvedLanguage from "../hooks/useResolvedLanguage";
import { translateText } from "../services/i18nService";
import {
  getSelectedText,
  resolveTranslatedText,
  speakText,
  stopSpeaking
} from "../utils/speech";

const RATE_MAP = {
  slow: 0.85,
  normal: 1,
  fast: 1.2
};

export default function SpeakButton({ className = "" }) {
  const { resolvedLanguage } = useResolvedLanguage();
  const [selectedText, setSelectedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rateMode, setRateMode] = useState("normal");

  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    const syncSelection = () => {
      setSelectedText(getSelectedText());
      setError("");
    };

    document.addEventListener("selectionchange", syncSelection);
    return () => {
      document.removeEventListener("selectionchange", syncSelection);
    };
  }, []);

  const canSpeak = useMemo(() => selectedText.length > 0, [selectedText]);

  const handleSpeakSelectedText = async () => {
    const rawSelection = selectedText || getSelectedText();
    if (!rawSelection) {
      setError("Select some text first.");
      return;
    }

    setError("");
    setIsLoading(true);
    try {
      const preparedText = await resolveTranslatedText({
        text: rawSelection,
        targetLang: resolvedLanguage,
        translator: async (text, targetLang) =>
          translateText({
            text,
            targetLang
          })
      });

      speakText(preparedText, resolvedLanguage, {
        rate: RATE_MAP[rateMode] || RATE_MAP.normal
      });
    } catch (speakError) {
      setError(speakError?.message || "Unable to speak selected text.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = () => {
    stopSpeaking();
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`} data-no-auto-translate="true">
      <button
        type="button"
        onMouseDown={(event) => event.preventDefault()}
        onClick={handleSpeakSelectedText}
        disabled={isLoading || !canSpeak}
        className="inline-flex items-center gap-2 rounded-lg border border-teal-300 bg-white px-3 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60"
        title="Speak Selected Text"
      >
        <span aria-hidden="true">Mic</span>
        {isLoading ? "Speaking..." : "Speak Selected Text"}
      </button>

      <button
        type="button"
        onClick={handleStop}
        className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        title="Stop Speaking"
      >
        Stop
      </button>

      <select
        value={rateMode}
        onChange={(event) => setRateMode(event.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs text-slate-700"
        title="Speech Rate"
      >
        <option value="slow">Slow</option>
        <option value="normal">Normal</option>
        <option value="fast">Fast</option>
      </select>

      {error && <span className="max-w-44 text-xs font-medium text-red-600">{error}</span>}
    </div>
  );
}
