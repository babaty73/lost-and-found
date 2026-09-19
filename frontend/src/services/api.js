import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const baseURL = rawBaseUrl.endsWith("/api")
  ? rawBaseUrl
  : rawBaseUrl.replace(/\/+$/, "") + "/api";

const api = axios.create({
  baseURL,
});

// Attaches the admin JWT (if one is stored) to every outgoing request.
// Public/student-facing calls simply won't have a token to attach and are
// unaffected. See services/adminAuth.js for how the token gets there.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("astu_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the backend ever says the admin session is no longer valid, clear the
// stale token so the UI doesn't keep presenting itself as logged in.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("astu_admin_token");
      localStorage.removeItem("astu_admin_user");
    }
    return Promise.reject(error);
  }
);

export default api;
