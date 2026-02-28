import apiClient from "./apiClient";

export const getStudentDashboard = async () => {
  const response = await apiClient.get("/student/dashboard");
  return response.data;
};

export const getMyProfile = async () => {
  const response = await apiClient.get("/student/profile");
  return response.data?.profile || null;
};

export const saveMyProfile = async (payload) => {
  const response = await apiClient.put("/student/profile", payload);
  return response.data;
};

export const getRecommendedScholarships = async () => {
  const response = await apiClient.get("/student/scholarships/recommended");
  return response.data;
};

export const discoverScholarships = async (params = {}) => {
  const response = await apiClient.get("/student/scholarships/discover", { params });
  return response.data;
};

export const getScholarshipById = async (id) => {
  const response = await apiClient.get(`/student/scholarships/${id}`);
  return response.data;
};

export const submitScholarshipFeedback = async (scholarshipId, payload = {}) => {
  const response = await apiClient.post(`/student/scholarships/${scholarshipId}/feedback`, payload);
  return response.data;
};

export const startApplication = async (scholarshipId) => {
  const response = await apiClient.post(`/student/applications/${scholarshipId}/start`);
  return response.data;
};

export const getMyApplications = async () => {
  const response = await apiClient.get("/student/applications");
  return response.data;
};

export const getApplicationById = async (applicationId) => {
  const response = await apiClient.get(`/student/applications/${applicationId}`);
  return response.data;
};

export const updateApplicationStep = async (applicationId, stepKey, isDone) => {
  const response = await apiClient.patch(`/student/applications/${applicationId}/steps/${stepKey}`, {
    isDone
  });
  return response.data;
};

export const submitApplication = async (applicationId) => {
  const response = await apiClient.post(`/student/applications/${applicationId}/submit`);
  return response.data;
};

export const updateMyApplicationStatus = async (applicationId, payload) => {
  const response = await apiClient.patch(`/student/applications/${applicationId}/status`, payload);
  return response.data;
};

export const uploadApplicationDocument = async (applicationId, documentType, file) => {
  const formData = new FormData();
  formData.append("documentType", documentType);
  formData.append("file", file);

  const response = await apiClient.post(`/student/applications/${applicationId}/documents`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data;
};

export const getMyNotifications = async () => {
  const response = await apiClient.get("/student/notifications");
  return response.data;
};

export const markNotificationAsRead = async (id) => {
  const response = await apiClient.patch(`/student/notifications/${id}/read`);
  return response.data;
};

// Assistance endpoints remain for continuity and moderator collaboration.
export const createAssistanceRequest = async (scholarshipId, message) => {
  const response = await apiClient.post("/student/assistance", { scholarshipId, message });
  return response.data;
};

export const getMyAssistanceRequests = async () => {
  const response = await apiClient.get("/student/assistance");
  return response.data;
};

export const replyToMyAssistanceRequest = async (id, message) => {
  const response = await apiClient.put(`/student/assistance/${id}/reply`, { message });
  return response.data;
};
