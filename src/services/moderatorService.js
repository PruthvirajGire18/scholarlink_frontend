import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// 🔐 Token attach automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const createScholarship = async (data) => {
  const res = await API.post("/moderator/scholarships", data);
  return res.data;
};

export const getMyScholarships = async () => {
  const res = await API.get("/moderator/scholarships");
  return res.data;
};

export const updateScholarship = async (id, data) => {
  const res = await API.put(`/moderator/scholarships/${id}`, data);
  return res.data;
};

export const deleteScholarship = async (id) => {
  const res = await API.delete(`/moderator/scholarships/${id}`);
  return res.data;
};

export const getAssistanceRequests = async (status) => {
  const res = await API.get("/moderator/assistance", {
    params: status ? { status } : {}
  });
  return res.data;
};

export const replyToAssistance = async (id, message) => {
  const res = await API.put(`/moderator/assistance/${id}/reply`, { message });
  return res.data;
};

export const resolveAssistance = async (id) => {
  const res = await API.put(`/moderator/assistance/${id}/resolve`);
  return res.data;
};

export const getScholarshipApplications = async (scholarshipId) => {
  const res = await API.get(`/moderator/scholarships/${scholarshipId}/applications`);
  return res.data;
};