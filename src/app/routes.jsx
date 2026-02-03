import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import StudentDashboard from "../pages/student/Dashboard";
import ScholarshipDetail from "../pages/student/ScholarshipDetail";
import StudentAssistanceList from "../pages/student/AssistanceList";
import StudentAssistanceThread from "../pages/student/AssistanceThread";
import ModeratorDashboard from "../pages/moderator/Dashboard";
import EditScholarship from "../pages/moderator/EditScholarship";
import ModeratorAssistanceInbox from "../pages/moderator/AssistanceInbox";
import ModeratorAssistanceThread from "../pages/moderator/AssistanceThread";
import AdminDashboard from "../pages/admin/Dashboard";
import VerificationQueue from "../pages/admin/VerificationQueue";
import AuditLogs from "../pages/admin/AuditLogs";
import FraudAlerts from "../pages/admin/FraudAlerts";
import ProtectedRoute from "../components/ProtectedRoute";
import Home from "../pages/Home";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Student Routes */}
      <Route path="/student" element={
        <ProtectedRoute role="STUDENT"><StudentDashboard/></ProtectedRoute>
      } />
      <Route path="/student/scholarships/:id" element={
        <ProtectedRoute role="STUDENT"><ScholarshipDetail/></ProtectedRoute>
      } />
      <Route path="/student/assistance" element={
        <ProtectedRoute role="STUDENT"><StudentAssistanceList/></ProtectedRoute>
      } />
      <Route path="/student/assistance/:id" element={
        <ProtectedRoute role="STUDENT"><StudentAssistanceThread/></ProtectedRoute>
      } />

      {/* Moderator Routes */}
      <Route path="/moderator" element={
        <ProtectedRoute role="MODERATOR"><ModeratorDashboard/></ProtectedRoute>
      } />
      <Route path="/moderator/my-scholarships" element={
        <ProtectedRoute role="MODERATOR"><ModeratorDashboard/></ProtectedRoute>
      } />
      <Route path="/moderator/scholarships/:id/edit" element={
        <ProtectedRoute role="MODERATOR"><EditScholarship/></ProtectedRoute>
      } />
      <Route path="/moderator/assistance" element={
        <ProtectedRoute role="MODERATOR"><ModeratorAssistanceInbox/></ProtectedRoute>
      } />
      <Route path="/moderator/assistance/:id" element={
        <ProtectedRoute role="MODERATOR"><ModeratorAssistanceThread/></ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute role="ADMIN"><AdminDashboard/></ProtectedRoute>
      } />
      <Route path="/admin/scholarships" element={
        <ProtectedRoute role="ADMIN"><AdminDashboard/></ProtectedRoute>
      } />
      <Route path="/admin/verification" element={
        <ProtectedRoute role={["ADMIN", "MODERATOR"]}><VerificationQueue/></ProtectedRoute>
      } />
      <Route path="/admin/audit-logs" element={
        <ProtectedRoute role="ADMIN"><AuditLogs/></ProtectedRoute>
      } />
      <Route path="/admin/fraud-alerts" element={
        <ProtectedRoute role="ADMIN"><FraudAlerts/></ProtectedRoute>
      } />
    </Routes>
  );
}
