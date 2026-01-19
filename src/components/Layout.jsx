import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Layout({ children }) {
  const location = useLocation();
  const hideNavbarPaths = ["/login", "/signup"];

  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname);

  return (
    <div>
      {!shouldHideNavbar && <Navbar />}
      {children}
    </div>
  );
}