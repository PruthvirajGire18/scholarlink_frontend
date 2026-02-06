import { useState, useRef, useEffect } from "react";
import { useTranslation } from "../../i18n";
import { useAccessibility } from "../../contexts/AccessibilityContext";
import LanguageSwitcher from "./LanguageSwitcher";

export default function AccessibilitySettings() {
  const { t } = useTranslation();
  const { voiceHintsEnabled, setVoiceHintsEnabled } = useAccessibility();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="relative flex items-center gap-2" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={t("common.accessibility")}
        title={t("common.accessibility")}
      >
        <span className="size-4 shrink-0" aria-hidden="true">
          ♿
        </span>
        <span className="hidden sm:inline">{t("common.settings")}</span>
      </button>
      {open && (
        <div
          role="dialog"
          aria-label={t("common.accessibility")}
          className="absolute right-0 top-full z-50 mt-1 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="font-semibold text-slate-900">
              {t("common.accessibility")}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label={t("common.close")}
            >
              ✕
            </button>
          </div>
          <div className="mt-3 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t("common.language")}
              </label>
              <div className="mt-1.5">
                <LanguageSwitcher />
              </div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="block text-sm font-medium text-slate-700">
                  {t("common.voiceHints")}
                </span>
                <span className="block text-xs text-slate-500">
                  {t("common.voiceHintsDesc")}
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={voiceHintsEnabled}
                onClick={() => setVoiceHintsEnabled(!voiceHintsEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 ${
                  voiceHintsEnabled ? "bg-teal-600" : "bg-slate-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
                    voiceHintsEnabled ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
