import apiClient from "./apiClient";

export const publicAnalyticsService = {
  async getSummary() {
    const { data } = await apiClient.get("/analytics/public-summary");
    return data;
  },

  async getConfig() {
    const { data } = await apiClient.get("/analytics/public-config");
    return data;
  },
};
