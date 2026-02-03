import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const getAllModerators = async () => {
  const res = await API.get("/admin/moderators");
  return res.data;
};

export const createModerator = async (data) => {
  const res = await API.post("/admin/moderator", data);
  return res.data;
};

export const getAllStudents = async () => {
  const res = await API.get("/admin/students");
  return res.data;
};

export const getPendingScholarships = async () => {
  const res = await API.get("/admin/pending-schoolerships");
  return res.data;
};

export const reviewScholarship = async (id, status, remarks = "") => {
  const res = await API.put(`/admin/schoolerships/${id}`, { status, remarks });
  return res.data;
};

export const getAllScholarships = async () => {
  const res = await API.get("/admin/schoolerships");
  return res.data;
};

export const getVerificationQueue = async () => {
  const res = await API.get("/admin/scholarships/verification-queue");
  return res.data;
};

export const verifyScholarship = async (id) => {
  const res = await API.put(`/admin/scholarships/${id}/verify`);
  return res.data;
};

export const flagScholarship = async (id, reason) => {
  const res = await API.put(`/admin/scholarships/${id}/flag`, { reason });
  return res.data;
};

export const addInternalNote = async (id, note) => {
  const res = await API.put(`/admin/scholarships/${id}/internal-note`, { note });
  return res.data;
};

export const getPendingDocuments = async () => {
  const res = await API.get("/admin/documents/pending");
  return res.data;
};

export const reviewDocument = async (id, status, rejectionReason = "") => {
  const res = await API.put(`/admin/documents/${id}/review`, { status, rejectionReason });
  return res.data;
};

export const getAuditLogs = async (params = {}) => {
  const res = await API.get("/admin/audit-logs", { params });
  return res.data;
};

export const getFraudAlerts = async (resolved) => {
  const res = await API.get("/admin/fraud-alerts", {
    params: resolved !== undefined ? { resolved: String(resolved) } : {}
  });
  return res.data;
};

export const markFraudAlertReviewed = async (id) => {
  const res = await API.put(`/admin/fraud-alerts/${id}/reviewed`);
  return res.data;
};
