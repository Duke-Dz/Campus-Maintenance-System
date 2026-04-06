import apiClient from "./apiClient";

export const authService = {
  async login(payload) {
    const { data } = await apiClient.post("/auth/login", payload);
    return data;
  },
  async refresh() {
    const { data } = await apiClient.post("/auth/refresh");
    return data;
  },
  async getCurrentUser() {
    const { data } = await apiClient.get("/auth/me");
    return data;
  },
  async logout() {
    const { data } = await apiClient.post("/auth/logout");
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
  async resendVerification(payloadOrEmail, captchaToken = "") {
    const payload = typeof payloadOrEmail === "string"
      ? { email: payloadOrEmail, captchaToken }
      : {
          email: payloadOrEmail?.email || "",
          captchaToken: payloadOrEmail?.captchaToken || "",
        };
    const { data } = await apiClient.post("/auth/resend-verification", payload);
    return data;
  },
  async forgotPassword(payloadOrEmail, captchaToken = "") {
    const payload = typeof payloadOrEmail === "string"
      ? { email: payloadOrEmail, captchaToken }
      : {
          email: payloadOrEmail?.email || "",
          captchaToken: payloadOrEmail?.captchaToken || "",
        };
    const { data } = await apiClient.post("/auth/forgot-password", payload);
    return data;
  },
  async resetPassword(token, newPassword) {
    const { data } = await apiClient.post("/auth/reset-password", { token, newPassword });
    return data;
  },
  async acceptStaffInvite(token, username, password) {
    const { data } = await apiClient.post("/auth/accept-staff-invite", { token, username, password });
    return data;
  },
  async verifyMfa(challengeId, code) {
    const { data } = await apiClient.post("/auth/verify-mfa", { challengeId, code });
    return data;
  },
  async resendMfa(challengeId) {
    const { data } = await apiClient.post("/auth/resend-mfa", { challengeId });
    return data;
  },
  async getUsernameSuggestions(username, fullName = "") {
    const params = new URLSearchParams({ username });
    if (fullName?.trim()) {
      params.set("fullName", fullName.trim());
    }
    const { data } = await apiClient.get(`/auth/username-suggestions?${params.toString()}`);
    return data?.suggestions || [];
  },
};
