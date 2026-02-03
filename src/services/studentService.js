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

export const getApprovedScholarships = async () => {
  const res = await API.get("/student/scholarships");
  return res.data;
};

export const getScholarshipById = async (id) => {
  const res = await API.get(`/student/scholarships/${id}`);
  return res.data;
};

export const createAssistanceRequest = async (scholarshipId, message) => {
  const res = await API.post("/student/assistance", { scholarshipId, message });
  return res.data;
};

export const getMyAssistanceRequests = async () => {
  const res = await API.get("/student/assistance");
  return res.data;
};