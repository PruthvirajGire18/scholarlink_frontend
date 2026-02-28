import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import {
  AccessibilityAutoSpeaker,
  TextSelectionVoiceAssistant,
  VoiceNavigationGuide
} from "./accessibility";
import AutoPageTranslator from "./i18n/AutoPageTranslator";

export default function Layout({ children }) {
  const location = useLocation();
  const hideNavbarPaths = ["/login", "/signup"];
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50">
      <AutoPageTranslator />
      <VoiceNavigationGuide />
      <AccessibilityAutoSpeaker />
      <TextSelectionVoiceAssistant />
      {!shouldHideNavbar && <Navbar />}
      <main className={shouldHideNavbar ? "" : "min-h-[calc(100vh-4rem)]"}>
        {children}
      </main>
    </div>
  );
}
