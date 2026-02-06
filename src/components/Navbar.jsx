import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "../i18n";
import { AccessibilitySettings, LanguageSwitcher } from "./accessibility";

const navLinkClass = (isActive) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-teal-600 text-white"
      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) {
    return (
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="page-container flex h-16 items-center justify-between">
          <Link
            to="/"
            className="text-xl font-bold tracking-tight text-teal-600 transition hover:text-teal-700"
          >
            {t("nav.brand")}
          </Link>
          <nav className="flex items-center gap-2">
            <LanguageSwitcher />
            <AccessibilitySettings />
            <Link
              to="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {t("nav.login")}
            </Link>
            <Link
              to="/signup"
              className="btn-primary"
            >
              {t("nav.signup")}
            </Link>
          </nav>
        </div>
      </header>
    );
  }

  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/student" || location.pathname === "/moderator" || location.pathname === "/admin"
      : location.pathname.startsWith(path);

  const studentNav = (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="page-container flex h-16 items-center justify-between">
        <Link to="/student" className="text-xl font-bold tracking-tight text-teal-600">
          {t("nav.brand")}
        </Link>
        <nav className="flex flex-wrap items-center gap-1">
          <LanguageSwitcher />
          <AccessibilitySettings />
          <Link to="/student" className={navLinkClass(location.pathname === "/student" || location.pathname === "/student/")}>
            {t("nav.scholarships")}
          </Link>
          <Link to="/student/assistance" className={navLinkClass(location.pathname === "/student/assistance")}>
            {t("nav.myAssistance")}
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600"
          >
            {t("nav.logout")}
          </button>
        </nav>
      </div>
    </header>
  );

  const adminNav = (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="page-container flex h-16 items-center justify-between">
        <Link to="/admin" className="text-xl font-bold tracking-tight text-teal-600">
          {t("nav.brand")} <span className="text-slate-400 font-medium">{t("nav.adminLabel")}</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1">
          <LanguageSwitcher />
          <AccessibilitySettings />
          <Link to="/admin" className={navLinkClass(location.pathname === "/admin" || location.pathname === "/admin/")}>
            {t("nav.overview")}
          </Link>
          <Link to="/admin/moderators" className={navLinkClass(location.pathname === "/admin/moderators" || location.pathname.startsWith("/admin/moderators"))}>
            {t("nav.moderators")}
          </Link>
          <Link to="/admin/scholarships" className={navLinkClass(location.pathname === "/admin/scholarships")}>
            {t("nav.scholarships")}
          </Link>
          <Link to="/admin/verification" className={navLinkClass(location.pathname === "/admin/verification")}>
            {t("nav.verification")}
          </Link>
          <Link to="/admin/documents" className={navLinkClass(location.pathname === "/admin/documents")}>
            {t("nav.documents")}
          </Link>
          <Link to="/admin/audit-logs" className={navLinkClass(location.pathname === "/admin/audit-logs")}>
            {t("nav.audit")}
          </Link>
          <Link to="/admin/fraud" className={navLinkClass(location.pathname === "/admin/fraud")}>
            {t("nav.fraud")}
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600"
          >
            {t("nav.logout")}
          </button>
        </nav>
      </div>
    </header>
  );

  const moderatorNav = (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="page-container flex h-16 items-center justify-between">
        <Link to="/moderator" className="text-xl font-bold tracking-tight text-teal-600">
          {t("nav.brand")} <span className="text-slate-400 font-medium">{t("nav.moderatorLabel")}</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1">
          <LanguageSwitcher />
          <AccessibilitySettings />
          <Link to="/moderator" className={navLinkClass(location.pathname === "/moderator" || location.pathname === "/moderator/")}>
            {t("nav.dashboard")}
          </Link>
          <Link to="/moderator/my-scholarships" className={navLinkClass(location.pathname === "/moderator/my-scholarships")}>
            {t("nav.myScholarships")}
          </Link>
          <Link to="/moderator/assistance" className={navLinkClass(location.pathname === "/moderator/assistance")}>
            {t("nav.assistance")}
          </Link>
          <Link to="/moderator/applications" className={navLinkClass(location.pathname === "/moderator/applications")}>
            {t("nav.applications")}
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600"
          >
            {t("nav.logout")}
          </button>
        </nav>
      </div>
    </header>
  );

  switch (user.role) {
    case "STUDENT":
      return studentNav;
    case "ADMIN":
      return adminNav;
    case "MODERATOR":
      return moderatorNav;
    default:
      return null;
  }
}
