import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout({ children }) {
  const location = useLocation();
  const hideNavbarPaths = ["/login", "/signup"];
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50">
      {!shouldHideNavbar && <Navbar />}
      <main className={shouldHideNavbar ? "" : "min-h-[calc(100vh-4rem)]"}>
        {children}
      </main>
    </div>
  );
}
