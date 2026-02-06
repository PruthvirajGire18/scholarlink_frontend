import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import StudentDashboard from "../pages/student/Dashboard";
import ModeratorDashboard from "../pages/moderator/Dashboard";
import AdminDashboard from "../pages/admin/Dashboard";
import ProtectedRoute from "../components/ProtectedRoute";
import Home from "../pages/Home";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/student/*" element={
        <ProtectedRoute role="STUDENT"><StudentDashboard/></ProtectedRoute>
      } />

      <Route path="/moderator/*" element={
        <ProtectedRoute role="MODERATOR"><ModeratorDashboard/></ProtectedRoute>
      } />

      <Route path="/admin/moderators" element={
        <ProtectedRoute role="ADMIN"><AdminDashboard/></ProtectedRoute>
      } />
      <Route path="/admin/*" element={
        <ProtectedRoute role="ADMIN"><AdminDashboard/></ProtectedRoute>
      } />
    </Routes>
  );
}
