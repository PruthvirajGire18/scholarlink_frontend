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

/**
 * STUDENT → Get all approved scholarships
 */
export const getApprovedScholarships = async () => {
  const res = await API.get("/student/scholarships");
  return res.data;
};