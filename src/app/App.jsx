import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import AppRoutes from "./routes";
import Layout from "../components/Layout";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <AppRoutes />
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}
