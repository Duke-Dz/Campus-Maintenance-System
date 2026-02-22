import apiClient from "./apiClient";

export const authService = {
  async login(payload) {
    const { data } = await apiClient.post("/auth/login", payload);
    return data;
  },
  async register(payload) {
    const { data } = await apiClient.post("/auth/register", payload);
    return data;
  },
  async verifyEmail(email, code) {
    const { data } = await apiClient.post("/auth/verify-email", { email, code });
    return data;
  },
  async resendVerification(email) {
    const { data } = await apiClient.post("/auth/resend-verification", { email });
    return data;
  },
  async forgotPassword(email) {
    const { data } = await apiClient.post("/auth/forgot-password", { email });
    return data;
  },
  async resetPassword(token, newPassword) {
    const { data } = await apiClient.post("/auth/reset-password", { token, newPassword });
    return data;
  },
};
