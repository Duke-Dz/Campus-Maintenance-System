import axios from "axios";
import toast from "react-hot-toast";

const AUTH_KEY = "scms.auth";

const getToken = () => {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw)?.token || null;
  } catch {
    return null;
  }
};

const apiClient = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Pages where we should never show session-expired toasts
const AUTH_PAGES = ["/login", "/register", "/forgot-password", "/reset-password"];
const isAuthPage = () => AUTH_PAGES.some((p) => window.location.pathname.startsWith(p));

// ---- Request interceptor: attach JWT token ----
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---- Response interceptor: handle errors globally ----
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";
    const isAuthEndpoint = url.includes("/auth/");

    if (status === 401 && !isAuthEndpoint && !isAuthPage()) {
      localStorage.removeItem(AUTH_KEY);
      toast.error("Session expired. Please sign in again.", { id: "session-expired" });
      window.location.href = "/login";
    } else if (status === 403 && !isAuthEndpoint) {
      toast.error("You don't have permission to perform this action.", { id: "forbidden" });
    } else if (status >= 500) {
      toast.error("Server error. Please try again later.", { id: "server-error" });
    }

    return Promise.reject(error);
  }
);

export default apiClient;
