import { useState, useRef, useEffect } from "react";
import { useTranslation } from "../../i18n";
import { languages } from "../../i18n/languages";

export default function LanguageSwitcher() {
  const { lang, setLanguage, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const current = languages.find((l) => l.code === lang) || languages[0];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t("common.language")}
        title={t("common.language")}
      >
        <span className="size-4 shrink-0 text-slate-500" aria-hidden="true">
          🌐
        </span>
        <span>{current.label}</span>
        <span className="text-slate-400" aria-hidden="true">
          {open ? "▲" : "▼"}
        </span>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-50 mt-1 min-w-[10rem] rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
          aria-label={t("common.language")}
        >
          {languages.map((l) => (
            <li key={l.code} role="option" aria-selected={lang === l.code}>
              <button
                type="button"
                onClick={() => {
                  setLanguage(l.code);
                  setOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm transition ${
                  lang === l.code
                    ? "bg-teal-50 font-medium text-teal-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
