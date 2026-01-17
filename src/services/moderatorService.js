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
  return API.post("/moderator/scholarships", data);
};

export const getMyScholarships = async () => {
  const res = await API.get("/moderator/scholarships");
  return res.data;
};