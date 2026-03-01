import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { AccessibilitySettings, LanguageSwitcher } from "./accessibility";
import { useTranslation } from "../i18n";
import SpeakButton from "./SpeakButton";

const navLinkClass = (active) =>
  `rounded-xl border px-3 py-2 text-sm font-semibold transition ${
    active
      ? "border-teal-500/40 bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-sm shadow-teal-700/25"
      : "border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-900"
  }`;

function Brand() {
  const { t } = useTranslation();

  return (
    <Link to="/" className="group inline-flex items-center gap-2 rounded-xl px-2 py-1 transition hover:bg-teal-50/70">
      <span className="grid h-9 w-9 place-content-center rounded-xl border border-teal-500/20 bg-gradient-to-br from-teal-600 to-cyan-600 text-sm font-bold text-white shadow-sm shadow-teal-700/30">
        SL
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-base font-extrabold tracking-tight text-slate-900 transition group-hover:text-teal-700">
          {t("nav.brand")}
        </span>
        <span className="text-xs font-medium text-slate-500">Scholarship companion</span>
      </span>
    </Link>
  );
}

function UtilityActions() {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-slate-200/75 bg-white/80 px-1 py-1 shadow-sm">
      <SpeakButton />
      <LanguageSwitcher />
      <AccessibilitySettings />
    </div>
  );
}

function PublicNav() {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/85 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.52)] backdrop-blur-xl">
      <div className="page-container flex items-center justify-between gap-3 py-3">
        <Brand />
        <nav className="flex items-center gap-2">
          <UtilityActions />
          <Link to="/login" className="btn-ghost">
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
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/90 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.52)] backdrop-blur-xl">
      <div className="page-container py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-3">
            <Brand />
            <span className="badge badge-neutral hidden sm:inline-flex">{baseLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <UtilityActions />
            <button
              onClick={onLogout}
              className="btn-ghost text-slate-600 hover:bg-red-50 hover:text-red-600"
            >
              {t("nav.logout")}
            </button>
          </div>
        </div>
        <nav className="mt-3 overflow-x-auto rounded-2xl border border-slate-200/75 bg-white/80 p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max items-center gap-2 pb-1">
            {links.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={navLinkClass(location.pathname === item.to || location.pathname.startsWith(`${item.to}/`))}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}

function RoleNav({ role, onLogout }) {
  const { t } = useTranslation();

  if (role === "STUDENT") {
    return (
      <UserNav
        baseLabel={t("nav.studentLabel")}
        onLogout={onLogout}
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

  if (role === "ADMIN") {
    return (
      <UserNav
        baseLabel={t("nav.adminLabel")}
        onLogout={onLogout}
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
      onLogout={onLogout}
      links={[
        { to: "/moderator", label: t("nav.create") },
        { to: "/moderator/my-scholarships", label: t("nav.myScholarships") },
        { to: "/moderator/assistance", label: t("nav.assistance") },
        { to: "/moderator/applications", label: t("nav.applications") }
      ]}
    />
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return <PublicNav />;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return <RoleNav role={user.role} onLogout={handleLogout} />;
}
