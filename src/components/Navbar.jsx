import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const navLinkClass = (isActive) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-teal-600 text-white"
      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
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
            ScholarLink
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="btn-primary"
            >
              Sign up
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
          ScholarLink
        </Link>
        <nav className="flex items-center gap-1">
          <Link to="/student" className={navLinkClass(location.pathname === "/student" || location.pathname === "/student/")}>
            Scholarships
          </Link>
          <Link to="/student/assistance" className={navLinkClass(location.pathname === "/student/assistance")}>
            My assistance
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600"
          >
            Log out
          </button>
        </nav>
      </div>
    </header>
  );

  const adminNav = (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="page-container flex h-16 items-center justify-between">
        <Link to="/admin" className="text-xl font-bold tracking-tight text-teal-600">
          ScholarLink <span className="text-slate-400 font-medium">Admin</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1">
          <Link to="/admin" className={navLinkClass(location.pathname === "/admin" || location.pathname === "/admin/")}>
            Overview
          </Link>
          <Link to="/admin/moderators" className={navLinkClass(location.pathname === "/admin/moderators")}>
            Moderators
          </Link>
          <Link to="/admin/scholarships" className={navLinkClass(location.pathname === "/admin/scholarships")}>
            Scholarships
          </Link>
          <Link to="/admin/verification" className={navLinkClass(location.pathname === "/admin/verification")}>
            Verification
          </Link>
          <Link to="/admin/documents" className={navLinkClass(location.pathname === "/admin/documents")}>
            Documents
          </Link>
          <Link to="/admin/audit-logs" className={navLinkClass(location.pathname === "/admin/audit-logs")}>
            Audit
          </Link>
          <Link to="/admin/fraud" className={navLinkClass(location.pathname === "/admin/fraud")}>
            Fraud
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600"
          >
            Log out
          </button>
        </nav>
      </div>
    </header>
  );

  const moderatorNav = (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="page-container flex h-16 items-center justify-between">
        <Link to="/moderator" className="text-xl font-bold tracking-tight text-teal-600">
          ScholarLink <span className="text-slate-400 font-medium">Moderator</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1">
          <Link to="/moderator" className={navLinkClass(location.pathname === "/moderator" || location.pathname === "/moderator/")}>
            Dashboard
          </Link>
          <Link to="/moderator/my-scholarships" className={navLinkClass(location.pathname === "/moderator/my-scholarships")}>
            My scholarships
          </Link>
          <Link to="/moderator/assistance" className={navLinkClass(location.pathname === "/moderator/assistance")}>
            Assistance
          </Link>
          <Link to="/moderator/applications" className={navLinkClass(location.pathname === "/moderator/applications")}>
            Applications
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600"
          >
            Log out
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
