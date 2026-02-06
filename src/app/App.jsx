import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import { LanguageProvider } from "../i18n";
import { AccessibilityProvider } from "../contexts/AccessibilityContext";
import AppRoutes from "./routes";
import Layout from "../components/Layout";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <AccessibilityProvider>
            <Layout>
              <AppRoutes />
            </Layout>
          </AccessibilityProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
