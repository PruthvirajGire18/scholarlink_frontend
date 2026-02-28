import { useEffect, useMemo, useState } from "react";
import useResolvedLanguage from "../../hooks/useResolvedLanguage";
import { translateText } from "../../services/i18nService";
import { resolveTranslatedText, speakText } from "../../utils/speech";
import { useAccessibility } from "../../contexts/AccessibilityContext";

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getSelectionPayload() {
  if (typeof window === "undefined") return null;
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null;

  const text = String(selection.toString() || "").trim();
  if (!text || text.length < 2) return null;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  if (!rect || (!rect.width && !rect.height)) return null;

  return { text, rect };
}

export default function TextSelectionVoiceAssistant() {
  const { resolvedLanguage } = useResolvedLanguage();
  const { speechRate } = useAccessibility();
  const [selectedText, setSelectedText] = useState("");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [previewText, setPreviewText] = useState("");

  const buttonStyle = useMemo(
    () => ({
      left: `${position.x}px`,
      top: `${position.y}px`
    }),
    [position]
  );

  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    const updateSelection = () => {
      const payload = getSelectionPayload();
      if (!payload) {
        setVisible(false);
        return;
      }

      const x = clamp(payload.rect.left + payload.rect.width / 2, 36, window.innerWidth - 36);
      const y = clamp(payload.rect.top - 18, 12, window.innerHeight - 12);

      setSelectedText(payload.text);
      setPosition({ x, y });
      setPreviewText("");
      setVisible(true);
    };

    const handleMouseUp = () => {
      setTimeout(updateSelection, 0);
    };

    const handleKeyUp = () => {
      setTimeout(updateSelection, 0);
    };

    const handleScrollOrResize = () => {
      if (!visible) return;
      const payload = getSelectionPayload();
      if (!payload) {
        setVisible(false);
        return;
      }
      const x = clamp(payload.rect.left + payload.rect.width / 2, 36, window.innerWidth - 36);
      const y = clamp(payload.rect.top - 18, 12, window.innerHeight - 12);
      setPosition({ x, y });
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("keyup", handleKeyUp);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [visible]);

  const translateAndSpeakSelection = async () => {
    if (!selectedText || isSpeaking) return;

    setIsSpeaking(true);
    try {
      const translated = await resolveTranslatedText({
        text: selectedText,
        targetLang: resolvedLanguage,
        translator: async (text, targetLang) => translateText({ text, targetLang })
      });
      setPreviewText(translated);
      speakText(translated, resolvedLanguage, {
        rate: speechRate === "slow" ? 0.85 : speechRate === "fast" ? 1.2 : 1
      });
    } catch {
      setPreviewText(selectedText);
      speakText(selectedText, resolvedLanguage, {
        rate: speechRate === "slow" ? 0.85 : speechRate === "fast" ? 1.2 : 1
      });
    } finally {
      setIsSpeaking(false);
    }
  };

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed z-[1200]"
      style={buttonStyle}
      data-no-auto-translate="true"
    >
      <div className="pointer-events-auto -translate-x-1/2 -translate-y-full">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={translateAndSpeakSelection}
          className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-3 py-1.5 text-xs font-semibold text-teal-700 shadow-lg hover:bg-teal-50 disabled:opacity-60"
          disabled={isSpeaking}
          title="Translate and speak selected text"
        >
          <span aria-hidden="true">Mic</span>
          {isSpeaking ? "Speaking..." : "Listen"}
        </button>
        {previewText && (
          <p className="mt-2 max-w-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow">
            {previewText}
          </p>
        )}
      </div>
    </div>
  );
}
