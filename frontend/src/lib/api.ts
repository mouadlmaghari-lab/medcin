import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1",
  withCredentials: false,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// ── Request interceptor — attach token ────────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("tabibcare_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Forward locale header
    const locale = localStorage.getItem("tabibcare_locale") ?? "fr";
    config.headers["Accept-Language"] = locale;
  }
  return config;
});

// ── Response interceptor — handle 401 globally ────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    if (status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("tabibcare_token");
        localStorage.removeItem("tabibcare_user");
        document.cookie = "tabibcare_token=; path=/; max-age=0";
        document.cookie = "tabibcare_role=; path=/; max-age=0";
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
