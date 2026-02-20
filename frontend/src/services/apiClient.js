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
const PUBLIC_ENDPOINTS = ["/analytics/public-summary", "/analytics/public-config", "/public/contact-support"];
const isPublicEndpoint = (url = "") => PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint));

// ---- Request interceptor: attach JWT token ----
apiClient.interceptors.request.use((config) => {
  const url = config?.url || "";
  const token = getToken();
  if (token && !isPublicEndpoint(url)) {
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
    const hasToken = Boolean(getToken());

    if (status === 401 && !isAuthEndpoint && !isPublicEndpoint(url) && !isAuthPage() && hasToken) {
      localStorage.removeItem(AUTH_KEY);
      toast.error("Session expired. Please sign in again.", { id: "session-expired" });
      window.location.href = "/";
    } else if (status === 403 && !isAuthEndpoint) {
      toast.error("You don't have permission to perform this action.", { id: "forbidden" });
    } else if (status >= 500) {
      toast.error("Server error. Please try again later.", { id: "server-error" });
    }

    return Promise.reject(error);
  }
);

export default apiClient;
