import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAccessibility } from "../../contexts/AccessibilityContext";
import useResolvedLanguage from "../../hooks/useResolvedLanguage";
import { translateText } from "../../services/i18nService";
import { resolveTranslatedText, speakText } from "../../utils/speech";

const RATE_MAP = {
  slow: 0.85,
  normal: 1,
  fast: 1.2
};

export default function AccessibilityAutoSpeaker() {
  const location = useLocation();
  const { accessibilityModeEnabled, speechRate } = useAccessibility();
  const { resolvedLanguage } = useResolvedLanguage();
  const lastHoveredTitleRef = useRef("");

  useEffect(() => {
    if (!accessibilityModeEnabled) return undefined;

    const speakHeading = async () => {
      const heading = document.querySelector("h1, h2, [data-voice-heading='true']");
      const headingText = String(heading?.textContent || "").trim();
      if (!headingText) return;

      try {
        const translatedHeading = await resolveTranslatedText({
          text: headingText,
          targetLang: resolvedLanguage,
          translator: async (text, targetLang) => translateText({ text, targetLang })
        });

        speakText(translatedHeading, resolvedLanguage, {
          rate: RATE_MAP[speechRate] || RATE_MAP.normal
        });
      } catch {
        // Ignore heading auto speak failures.
      }
    };

    void speakHeading();
    return undefined;
  }, [accessibilityModeEnabled, location.pathname, resolvedLanguage, speechRate]);

  useEffect(() => {
    if (!accessibilityModeEnabled) return undefined;

    const handleMouseOver = async (event) => {
      const element = event.target instanceof Element ? event.target.closest("[data-scholarship-title]") : null;
      if (!element) return;

      const titleText = String(element.textContent || "").trim();
      if (!titleText || titleText === lastHoveredTitleRef.current) return;
      lastHoveredTitleRef.current = titleText;

      try {
        const translatedTitle = await resolveTranslatedText({
          text: titleText,
          targetLang: resolvedLanguage,
          translator: async (text, targetLang) => translateText({ text, targetLang })
        });

        speakText(translatedTitle, resolvedLanguage, {
          rate: RATE_MAP[speechRate] || RATE_MAP.normal
        });
      } catch {
        // Ignore hover speak failures.
      }
    };

    document.addEventListener("mouseover", handleMouseOver);
    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
    };
  }, [accessibilityModeEnabled, resolvedLanguage, speechRate]);

  return null;
}
