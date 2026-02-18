import api from "./api";
import { setToken, setRole, clear } from "../utils/authStorage";

export const authService = {
  login(credentials) {
    return api.post("/auth/login", credentials, {
      headers: { "Content-Type": "application/json" },
    }).then((res) => {
      const { token, role } = res.data;
      setToken(token);
      setRole(role);
      return res.data;
    });
  },

  register(payload) {
    return api.post("/auth/register", payload).then((res) => {
      const { token, role } = res.data;
      setToken(token);
      setRole(role);
      return res.data;
    });
  },

  requestPasswordReset(email) {
    return api.post("/auth/forgot-password", { email }).then((res) => res.data);
  },

  resetPassword(payload) {
    return api.post("/auth/reset-password", payload).then((res) => res.data);
  },

  getSocialLinks() {
    return api.get("/public/social-links").then((res) => res.data);
  },

  clickSocial(platform) {
    return api.post(`/public/social-links/${platform}/click`).then((res) => res.data);
  },

  logout() {
    clear();
  },
};
