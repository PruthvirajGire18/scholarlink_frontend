import apiClient from "./apiClient";

export const getAdminAnalytics = async () => {
  const response = await apiClient.get("/admin/dashboard/analytics");
  return response.data;
};

export const getAllStudents = async () => {
  const response = await apiClient.get("/admin/students");
  return response.data;
};

export const getStudentProfile = async (studentId) => {
  const response = await apiClient.get(`/admin/students/${studentId}/profile`);
  return response.data;
};

export const sendStudentReminder = async (studentId, payload) => {
  const response = await apiClient.post(`/admin/students/${studentId}/reminder`, payload);
  return response.data;
};

export const getAllModerators = async () => {
  const response = await apiClient.get("/admin/moderators");
  return response.data;
};

export const createModerator = async (payload) => {
  const response = await apiClient.post("/admin/moderator", payload);
  return response.data;
};

export const getAllScholarships = async (params = {}) => {
  const response = await apiClient.get("/admin/scholarships", { params });
  return response.data;
};

export const getPendingScholarships = async () => {
  const response = await apiClient.get("/admin/scholarships/pending");
  return response.data;
};

export const reviewScholarship = async (
  id,
  status,
  remarks = "",
  enrichment = null,
  feedbackIds = []
) => {
  const payload = { status, remarks };
  if (enrichment && typeof enrichment === "object") {
    payload.enrichment = enrichment;
  }
  if (Array.isArray(feedbackIds) && feedbackIds.length > 0) {
    payload.feedbackIds = feedbackIds;
  }
  const response = await apiClient.put(`/admin/scholarships/${id}/review`, payload);
  return response.data;
};

export const getScholarshipFeedback = async (status = "OPEN", limit = 200) => {
  const response = await apiClient.get("/admin/scholarships/feedback", {
    params: { status, limit }
  });
  return response.data;
};

export const updateScholarshipFeedbackStatus = async (id, payload) => {
  const response = await apiClient.patch(`/admin/scholarships/feedback/${id}`, payload);
  return response.data;
};

export const getVerificationQueue = async () => {
  const response = await apiClient.get("/admin/scholarships/verification-queue");
  return response.data;
};

export const verifyScholarship = async (id) => {
  const response = await apiClient.put(`/admin/scholarships/${id}/verify`);
  return response.data;
};

export const flagScholarship = async (id, reason) => {
  const response = await apiClient.put(`/admin/scholarships/${id}/flag`, { reason });
  return response.data;
};

export const addInternalNote = async (id, note) => {
  const response = await apiClient.put(`/admin/scholarships/${id}/internal-note`, { note });
  return response.data;
};

export const getPendingDocuments = async () => {
  const response = await apiClient.get("/admin/documents/pending");
  return response.data;
};

export const reviewDocument = async (id, status, rejectionReason = "", reviewComment = "") => {
  const response = await apiClient.put(`/admin/documents/${id}/review`, {
    status,
    rejectionReason,
    reviewComment
  });
  return response.data;
};

export const getApplications = async (params = {}) => {
  const response = await apiClient.get("/admin/applications", { params });
  return response.data;
};

export const updateApplicationStatus = async (id, payload) => {
  const response = await apiClient.patch(`/admin/applications/${id}/status`, payload);
  return response.data;
};

export const getCommonRejectionReasons = async () => {
  const response = await apiClient.get("/admin/rejections/reasons");
  return response.data;
};

export const getAuditLogs = async (params = {}) => {
  const response = await apiClient.get("/admin/audit-logs", { params });
  return response.data;
};

export const getFraudAlerts = async (resolved) => {
  const response = await apiClient.get("/admin/fraud-alerts", {
    params: resolved !== undefined ? { resolved: String(resolved) } : {}
  });
  return response.data;
};

export const markFraudAlertReviewed = async (id) => {
  const response = await apiClient.put(`/admin/fraud-alerts/${id}/reviewed`);
  return response.data;
};

export const getIngestionStatus = async () => {
  const response = await apiClient.get("/ingestion/status");
  return response.data;
};

export const getIngestionRuns = async (limit = 20) => {
  const response = await apiClient.get("/ingestion/runs", {
    params: { limit }
  });
  return response.data;
};

export const runIngestionNow = async () => {
  const response = await apiClient.post("/ingestion/run");
  return response.data;
};
