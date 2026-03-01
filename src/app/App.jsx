import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import { LanguageProvider, useTranslation } from "../i18n";
import { AccessibilityProvider } from "../contexts/AccessibilityContext";
import AppRoutes from "./routes";
import Layout from "../components/Layout";

function LocalizedAppShell() {
  const { lang } = useTranslation();

  return (
    <AccessibilityProvider>
      <Layout key={`layout-${lang}`}>
        <AppRoutes />
      </Layout>
    </AccessibilityProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <LocalizedAppShell />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
