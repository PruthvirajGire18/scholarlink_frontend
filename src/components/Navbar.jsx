import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) {
    return (
      <nav className="w-full bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-indigo-600">
          ScholarLink
        </Link>

        <div className="space-x-4">
          <Link
            to="/login"
            className="text-indigo-600 font-medium hover:underline"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Sign Up
          </Link>
        </div>
      </nav>
    );
  }

  const renderStudentNavbar = () => (
    <nav className="w-full bg-white shadow-sm px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-indigo-600">
        ScholarLink - Student
      </Link>

      <div className="space-x-4">
        <Link
          to="/student"
          className="text-indigo-600 font-medium hover:underline"
        >
          Dashboard
        </Link>

        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </nav>
  );

  const renderAdminNavbar = () => (
    <nav className="w-full bg-white shadow-sm px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-indigo-600">
        ScholarLink - Admin
      </Link>

      <div className="space-x-4">
        <Link
          to="/admin"
          className="text-indigo-600 font-medium hover:underline"
        >
          Dashboard
        </Link>

        <Link
          to="/admin/moderators"
          className="text-indigo-600 font-medium hover:underline"
        >
          Moderators
        </Link>

        <Link
          to="/admin/scholarships"
          className="text-indigo-600 font-medium hover:underline"
        >
          Scholarships
        </Link>

        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </nav>
  );

  const renderModeratorNavbar = () => (
    <nav className="w-full bg-white shadow-sm px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-indigo-600">
        ScholarLink - Moderator
      </Link>

      <div className="space-x-4">
        <Link
          to="/moderator"
          className="text-indigo-600 font-medium hover:underline"
        >
          Dashboard
        </Link>

        <Link
          to="/moderator/create"
          className="text-indigo-600 font-medium hover:underline"
        >
          Create Scholarship
        </Link>

        <Link
          to="/moderator/my-scholarships"
          className="text-indigo-600 font-medium hover:underline"
        >
          My Scholarships
        </Link>

        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </nav>
  );

  switch (user.role) {
    case "STUDENT":
      return renderStudentNavbar();
    case "ADMIN":
      return renderAdminNavbar();
    case "MODERATOR":
      return renderModeratorNavbar();
    default:
      return null;
  }
}
