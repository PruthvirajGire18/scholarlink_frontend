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
    <div className="app-shell relative overflow-x-clip">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-teal-200/25 blur-3xl" />
        <div className="absolute bottom-10 right-4 h-64 w-64 rounded-full bg-cyan-200/20 blur-3xl" />
      </div>
      <AutoPageTranslator />
      <VoiceNavigationGuide />
      <AccessibilityAutoSpeaker />
      <TextSelectionVoiceAssistant />
      {!shouldHideNavbar && <Navbar />}
      <main className={shouldHideNavbar ? "min-h-screen" : "min-h-[calc(100vh-5.5rem)]"}>
        {children}
      </main>
    </div>
  );
}
