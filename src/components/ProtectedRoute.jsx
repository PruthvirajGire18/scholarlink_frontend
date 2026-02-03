import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const userRole = localStorage.getItem("role");
  const allowed = Array.isArray(role) ? role : [role];
  return allowed.includes(userRole) ? children : <Navigate to="/" />;
}
