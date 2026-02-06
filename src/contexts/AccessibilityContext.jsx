import { createContext, useContext, useState, useCallback, useEffect } from "react";

const STORAGE_KEY_VOICE_HINTS = "app_voice_hints";

const AccessibilityContext = createContext(null);

function getStoredVoiceHints() {
  try {
    const v = localStorage.getItem(STORAGE_KEY_VOICE_HINTS);
    return v === "true";
  } catch (_) {}
  return false;
}

export function AccessibilityProvider({ children }) {
  const [voiceHintsEnabled, setVoiceHintsEnabledState] = useState(getStoredVoiceHints);

  const setVoiceHintsEnabled = useCallback((enabled) => {
    setVoiceHintsEnabledState(Boolean(enabled));
    try {
      localStorage.setItem(STORAGE_KEY_VOICE_HINTS, String(Boolean(enabled)));
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const value = {
    voiceHintsEnabled,
    setVoiceHintsEnabled,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return ctx;
}
