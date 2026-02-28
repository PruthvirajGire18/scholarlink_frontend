import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "../i18n";
import { getAuthenticatedProfile } from "../services/profileService";
import { normalizeAppLanguage } from "../utils/speech";

function getI18nextLanguage() {
  if (typeof window === "undefined") return "";
  const candidate = window?.i18next?.language || window?.i18n?.language || "";
  return String(candidate || "").trim();
}

export default function useResolvedLanguage() {
  const { lang } = useTranslation();
  const [profileLanguage, setProfileLanguage] = useState("");

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("token");
    if (!token) return undefined;

    (async () => {
      try {
        const profile = await getAuthenticatedProfile();
        const preferredFromProfile =
          profile?.preferredLanguage ||
          (Array.isArray(profile?.preferredLanguages) ? profile.preferredLanguages[0] : "") ||
          "";
        if (active) setProfileLanguage(String(preferredFromProfile || "").trim());
      } catch {
        if (active) setProfileLanguage("");
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const resolvedLanguage = useMemo(() => {
    const i18nextLang = getI18nextLanguage();
    // User-selected app language should always win for live switching.
    return normalizeAppLanguage(lang || profileLanguage || i18nextLang || "en");
  }, [lang, profileLanguage]);

  return {
    resolvedLanguage,
    profileLanguage
  };
}
