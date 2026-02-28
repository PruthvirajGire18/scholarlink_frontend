import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import StudentDashboard from "../pages/student/Dashboard";
import ScholarshipDetail from "../pages/student/ScholarshipDetail";
import MyAssistance from "../pages/student/MyAssistance";
import AssistanceThread from "../pages/student/AssistanceThread";
import ModeratorDashboard from "../pages/moderator/Dashboard";
import AdminDashboard from "../pages/admin/Dashboard";
import VerificationQueue from "../pages/admin/VerificationQueue";
import AuditLogs from "../pages/admin/AuditLogs";
import FraudPanel from "../pages/admin/FraudPanel";
import ScholarshipReview from "../pages/admin/ScholarshipReview";
import IngestionPage from "../pages/admin/Ingestion";
import ProtectedRoute from "../components/ProtectedRoute";
import Home from "../pages/Home";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/student" element={<ProtectedRoute role="STUDENT"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute role="STUDENT"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/applications" element={<ProtectedRoute role="STUDENT"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/notifications" element={<ProtectedRoute role="STUDENT"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/scholarships/:id" element={<ProtectedRoute role="STUDENT"><ScholarshipDetail /></ProtectedRoute>} />
      <Route path="/student/assistance" element={<ProtectedRoute role="STUDENT"><MyAssistance /></ProtectedRoute>} />
      <Route path="/student/assistance/:id" element={<ProtectedRoute role="STUDENT"><AssistanceThread /></ProtectedRoute>} />

      <Route path="/moderator" element={<ProtectedRoute role="MODERATOR"><ModeratorDashboard /></ProtectedRoute>} />
      <Route path="/moderator/my-scholarships" element={<ProtectedRoute role="MODERATOR"><ModeratorDashboard /></ProtectedRoute>} />
      <Route path="/moderator/assistance" element={<ProtectedRoute role="MODERATOR"><ModeratorDashboard /></ProtectedRoute>} />
      <Route path="/moderator/applications" element={<ProtectedRoute role="MODERATOR"><ModeratorDashboard /></ProtectedRoute>} />

      <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/applications" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/documents" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/insights" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/moderators" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/scholarships" element={<ProtectedRoute role="ADMIN"><ScholarshipReview /></ProtectedRoute>} />
      <Route path="/admin/verification" element={<ProtectedRoute role="ADMIN"><VerificationQueue /></ProtectedRoute>} />
      <Route path="/admin/audit" element={<ProtectedRoute role="ADMIN"><AuditLogs /></ProtectedRoute>} />
      <Route path="/admin/fraud" element={<ProtectedRoute role="ADMIN"><FraudPanel /></ProtectedRoute>} />
      <Route path="/admin/ingestion" element={<ProtectedRoute role="ADMIN"><IngestionPage /></ProtectedRoute>} />
    </Routes>
  );
}
