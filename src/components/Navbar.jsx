import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { AccessibilitySettings, LanguageSwitcher } from "./accessibility";
import { useTranslation } from "../i18n";
import SpeakButton from "./SpeakButton";

const navLinkClass = (active) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    active ? "bg-teal-600 text-white" : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
  }`;

function Brand() {
  const { t } = useTranslation();

  return (
    <Link to="/" className="text-xl font-bold tracking-tight text-teal-600 transition hover:text-teal-700">
      {t("nav.brand")}
    </Link>
  );
}

function PublicNav() {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="page-container flex h-16 items-center justify-between">
        <Brand />
        <nav className="flex items-center gap-2">
          <SpeakButton />
          <LanguageSwitcher />
          <AccessibilitySettings />
          <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
            {t("nav.login")}
          </Link>
          <Link to="/signup" className="btn-primary">
            {t("nav.signup")}
          </Link>
        </nav>
      </div>
    </header>
  );
}

function UserNav({ links, baseLabel, onLogout }) {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="page-container flex h-16 items-center justify-between">
        <Link to={links[0].to} className="text-xl font-bold tracking-tight text-teal-600">
          {t("nav.brand")} <span className="text-slate-400 font-medium">{baseLabel}</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1">
          <SpeakButton />
          <LanguageSwitcher />
          <AccessibilitySettings />
          {links.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={navLinkClass(location.pathname === item.to || location.pathname.startsWith(`${item.to}/`))}
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={onLogout}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600"
          >
            {t("nav.logout")}
          </button>
        </nav>
      </div>
    </header>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!user) return <PublicNav />;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (user.role === "STUDENT") {
    return (
      <UserNav
        baseLabel={t("nav.studentLabel")}
        onLogout={handleLogout}
        links={[
          { to: "/student", label: t("nav.dashboard") },
          { to: "/student/profile", label: t("nav.profile") },
          { to: "/student/applications", label: t("nav.applications") },
          { to: "/student/notifications", label: t("nav.notifications") },
          { to: "/student/assistance", label: t("nav.help") }
        ]}
      />
    );
  }

  if (user.role === "ADMIN") {
    return (
      <UserNav
        baseLabel={t("nav.adminLabel")}
        onLogout={handleLogout}
        links={[
          { to: "/admin", label: t("nav.overview") },
          { to: "/admin/students", label: t("nav.students") },
          { to: "/admin/scholarships", label: t("nav.scholarships") },
          { to: "/admin/applications", label: t("nav.applications") },
          { to: "/admin/documents", label: t("nav.documents") },
          { to: "/admin/insights", label: t("nav.insights") },
          { to: "/admin/moderators", label: t("nav.moderators") },
          { to: "/admin/verification", label: t("nav.verification") },
          { to: "/admin/ingestion", label: t("nav.ingestion") },
          { to: "/admin/audit", label: t("nav.audit") },
          { to: "/admin/fraud", label: t("nav.fraud") }
        ]}
      />
    );
  }

  return (
    <UserNav
      baseLabel={t("nav.moderatorLabel")}
      onLogout={handleLogout}
      links={[
        { to: "/moderator", label: t("nav.create") },
        { to: "/moderator/my-scholarships", label: t("nav.myScholarships") },
        { to: "/moderator/assistance", label: t("nav.assistance") },
        { to: "/moderator/applications", label: t("nav.applications") }
      ]}
    />
  );
}
