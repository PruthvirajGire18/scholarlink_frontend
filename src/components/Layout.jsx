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
        <div className="absolute -top-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-teal-200/30 blur-3xl" />
        <div className="absolute bottom-8 right-4 h-64 w-64 rounded-full bg-cyan-200/22 blur-3xl" />
        <div className="absolute bottom-20 left-0 h-56 w-56 rounded-full bg-amber-200/18 blur-3xl" />
      </div>
      <AutoPageTranslator />
      <VoiceNavigationGuide />
      <AccessibilityAutoSpeaker />
      <TextSelectionVoiceAssistant />
      {!shouldHideNavbar && <Navbar />}
      <main className={shouldHideNavbar ? "min-h-screen" : "min-h-[calc(100vh-5.5rem)] animate-[fadeLift_260ms_ease]"}>
        {children}
      </main>
    </div>
  );
}
