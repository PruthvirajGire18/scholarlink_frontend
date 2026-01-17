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
 * ADMIN → Get all moderators
 */
export const getAllModerators = async () => {
  const res = await API.get("/admin/moderators");
  return res.data;
};

/**
 * ADMIN → Create moderator
 */
export const createModerator = async (data) => {
  const res = await API.post("/admin/moderator", data);
  return res.data;
};

export const getPendingScholarships = async () => {
  const res = await API.get("/admin/pending-schoolerships");
  return res.data;
};

export const reviewScholarship = async (id, status) => {
  return API.put(`/admin/schoolerships/${id}`, { status });
};

export const getAllScholarships = async () => {
  const res = await API.get(`/admin/schoolerships`);
  return res.data;
}
