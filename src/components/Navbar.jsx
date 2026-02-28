import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { AccessibilitySettings, LanguageSwitcher } from "./accessibility";

const navLinkClass = (active) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    active ? "bg-teal-600 text-white" : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
  }`;

function Brand() {
  return (
    <Link to="/" className="text-xl font-bold tracking-tight text-teal-600 transition hover:text-teal-700">
      ScholarLink
    </Link>
  );
}

function PublicNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="page-container flex h-16 items-center justify-between">
        <Brand />
        <nav className="flex items-center gap-2">
          <LanguageSwitcher />
          <AccessibilitySettings />
          <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
            Log in
          </Link>
          <Link to="/signup" className="btn-primary">
            Sign up
          </Link>
        </nav>
      </div>
    </header>
  );
}

function UserNav({ links, baseLabel, onLogout }) {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="page-container flex h-16 items-center justify-between">
        <Link to={links[0].to} className="text-xl font-bold tracking-tight text-teal-600">
          ScholarLink <span className="text-slate-400 font-medium">{baseLabel}</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1">
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
            Log out
          </button>
        </nav>
      </div>
    </header>
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

  if (user.role === "STUDENT") {
    return (
      <UserNav
        baseLabel="Student"
        onLogout={handleLogout}
        links={[
          { to: "/student", label: "Dashboard" },
          { to: "/student/profile", label: "Profile" },
          { to: "/student/applications", label: "Applications" },
          { to: "/student/notifications", label: "Notifications" },
          { to: "/student/assistance", label: "Help" }
        ]}
      />
    );
  }

  if (user.role === "ADMIN") {
    return (
      <UserNav
        baseLabel="Admin"
        onLogout={handleLogout}
        links={[
          { to: "/admin", label: "Overview" },
          { to: "/admin/students", label: "Students" },
          { to: "/admin/scholarships", label: "Scholarships" },
          { to: "/admin/applications", label: "Applications" },
          { to: "/admin/documents", label: "Documents" },
          { to: "/admin/insights", label: "Insights" },
          { to: "/admin/moderators", label: "Moderators" },
          { to: "/admin/verification", label: "Verification" },
          { to: "/admin/ingestion", label: "Ingestion" },
          { to: "/admin/audit", label: "Audit" },
          { to: "/admin/fraud", label: "Fraud" }
        ]}
      />
    );
  }

  return (
    <UserNav
      baseLabel="Moderator"
      onLogout={handleLogout}
      links={[
        { to: "/moderator", label: "Create" },
        { to: "/moderator/my-scholarships", label: "My Scholarships" },
        { to: "/moderator/assistance", label: "Assistance" },
        { to: "/moderator/applications", label: "Applications" }
      ]}
    />
  );
}
