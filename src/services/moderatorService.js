import apiClient from "./apiClient";

export const createScholarship = async (data) => {
  const response = await apiClient.post("/moderator/scholarships", data);
  return response.data;
};

export const getMyScholarships = async () => {
  const response = await apiClient.get("/moderator/scholarships");
  return response.data;
};

export const updateScholarship = async (id, data) => {
  const response = await apiClient.put(`/moderator/scholarships/${id}`, data);
  return response.data;
};

export const deleteScholarship = async (id) => {
  const response = await apiClient.delete(`/moderator/scholarships/${id}`);
  return response.data;
};

export const getAssistanceRequests = async (status) => {
  const response = await apiClient.get("/moderator/assistance", {
    params: status ? { status } : {}
  });
  return response.data;
};

export const getAssistanceRequestDetail = async (id) => {
  const response = await apiClient.get(`/moderator/assistance/${id}`);
  return response.data;
};

export const replyToAssistance = async (id, message) => {
  const response = await apiClient.put(`/moderator/assistance/${id}/reply`, { message });
  return response.data;
};

export const resolveAssistance = async (id) => {
  const response = await apiClient.put(`/moderator/assistance/${id}/resolve`);
  return response.data;
};

export const getScholarshipApplications = async (scholarshipId) => {
  const response = await apiClient.get(`/moderator/scholarships/${scholarshipId}/applications`);
  return response.data;
};
