import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAccessibility } from "../../contexts/AccessibilityContext";
import { useTranslation } from "../../i18n";
import { speakHint } from "../../utils/voiceHints";
import useAutoTranslateText from "../../hooks/useAutoTranslateText";
import useResolvedLanguage from "../../hooks/useResolvedLanguage";

function resolveRouteHintKey(pathname) {
  if (!pathname || pathname === "/") return "home";
  if (pathname === "/login") return "login";
  if (pathname === "/signup") return "signup";

  if (pathname === "/student") return "studentDashboard";
  if (pathname === "/student/profile") return "studentProfile";
  if (pathname === "/student/applications") return "studentApplications";
  if (pathname === "/student/notifications") return "studentNotifications";
  if (pathname.startsWith("/student/scholarships/")) return "studentScholarshipDetail";
  if (pathname.startsWith("/student/assistance")) return "studentAssistance";

  if (pathname === "/moderator") return "moderatorCreate";
  if (pathname === "/moderator/my-scholarships") return "moderatorScholarships";
  if (pathname === "/moderator/assistance") return "moderatorAssistance";
  if (pathname === "/moderator/applications") return "moderatorApplications";

  if (pathname === "/admin") return "adminOverview";
  if (pathname === "/admin/students") return "adminStudents";
  if (pathname === "/admin/scholarships") return "adminScholarships";
  if (pathname === "/admin/applications") return "adminApplications";
  if (pathname === "/admin/documents") return "adminDocuments";
  if (pathname === "/admin/moderators") return "adminModerators";
  if (pathname === "/admin/verification") return "adminVerification";
  if (pathname === "/admin/ingestion") return "adminIngestion";
  if (pathname === "/admin/audit") return "adminAudit";
  if (pathname === "/admin/fraud") return "adminFraud";

  return "generic";
}

export default function VoiceNavigationGuide() {
  const location = useLocation();
  const { voiceHintsEnabled } = useAccessibility();
  const { t } = useTranslation();
  const { resolvedLanguage } = useResolvedLanguage();
  const routeKey = resolveRouteHintKey(location.pathname);
  const translationKey = `voiceHints.route.${routeKey}`;
  const templateHint = t(translationKey);
  const autoTranslatedHint = useAutoTranslateText(templateHint, { targetLang: resolvedLanguage });

  useEffect(() => {
    if (!voiceHintsEnabled) return;
    if (!templateHint || templateHint === translationKey) return;
    speakHint(autoTranslatedHint || templateHint, resolvedLanguage);
  }, [voiceHintsEnabled, templateHint, autoTranslatedHint, translationKey, resolvedLanguage]);

  return null;
}
