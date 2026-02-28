import { createContext, useContext, useState, useCallback, useEffect } from "react";

const STORAGE_KEY_VOICE_HINTS = "app_voice_hints";
const STORAGE_KEY_ACCESSIBILITY_MODE = "app_accessibility_mode";
const STORAGE_KEY_SPEECH_RATE = "app_speech_rate";

const AccessibilityContext = createContext(null);

function getStoredVoiceHints() {
  try {
    const v = localStorage.getItem(STORAGE_KEY_VOICE_HINTS);
    return v === "true";
  } catch (_) {}
  return false;
}

function getStoredAccessibilityMode() {
  try {
    const value = localStorage.getItem(STORAGE_KEY_ACCESSIBILITY_MODE);
    return value === "true";
  } catch (_) {}
  return false;
}

function getStoredSpeechRate() {
  try {
    const value = String(localStorage.getItem(STORAGE_KEY_SPEECH_RATE) || "normal").trim().toLowerCase();
    if (["slow", "normal", "fast"].includes(value)) return value;
  } catch (_) {}
  return "normal";
}

export function AccessibilityProvider({ children }) {
  const [voiceHintsEnabled, setVoiceHintsEnabledState] = useState(getStoredVoiceHints);
  const [accessibilityModeEnabled, setAccessibilityModeEnabledState] = useState(getStoredAccessibilityMode);
  const [speechRate, setSpeechRateState] = useState(getStoredSpeechRate);

  const setVoiceHintsEnabled = useCallback((enabled) => {
    setVoiceHintsEnabledState(Boolean(enabled));
    try {
      localStorage.setItem(STORAGE_KEY_VOICE_HINTS, String(Boolean(enabled)));
    } catch (_) {}
  }, []);

  const setAccessibilityModeEnabled = useCallback((enabled) => {
    setAccessibilityModeEnabledState(Boolean(enabled));
    try {
      localStorage.setItem(STORAGE_KEY_ACCESSIBILITY_MODE, String(Boolean(enabled)));
    } catch (_) {}
  }, []);

  const setSpeechRate = useCallback((mode) => {
    const normalized = ["slow", "normal", "fast"].includes(mode) ? mode : "normal";
    setSpeechRateState(normalized);
    try {
      localStorage.setItem(STORAGE_KEY_SPEECH_RATE, normalized);
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
    accessibilityModeEnabled,
    setAccessibilityModeEnabled,
    speechRate,
    setSpeechRate
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
