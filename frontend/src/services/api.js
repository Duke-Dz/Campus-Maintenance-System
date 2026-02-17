import axios from "axios";
import { getToken } from "../utils/authStorage";

// Relative /api works: in Docker nginx proxies to backend; in dev Vite proxy forwards to 8080
const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
