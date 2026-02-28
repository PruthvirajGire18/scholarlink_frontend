import axios from "axios";

const DEFAULT_DEV_API_BASE_URL = "http://localhost:5000/api";
const DEFAULT_PROD_API_BASE_URL = "https://scholarlink-backend.vercel.app/api";

const resolveApiBaseUrl = () =>
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? DEFAULT_DEV_API_BASE_URL : DEFAULT_PROD_API_BASE_URL);

export const API_BASE_URL = resolveApiBaseUrl();

export const API_ORIGIN = (() => {
  try {
    if (API_BASE_URL.startsWith("/")) return window.location.origin;
    return new URL(API_BASE_URL).origin;
  } catch {
    return window.location.origin;
  }
})();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
