import apiClient from "./apiClient";

export const analyticsService = {
  async getSummary() {
    const { data } = await apiClient.get("/analytics/summary");
    return data;
  },
  async getResolutionTime() {
    const { data } = await apiClient.get("/analytics/resolution-time");
    return data;
  },
  async getTopBuildings() {
    const { data } = await apiClient.get("/analytics/top-buildings");
    return data;
  },
  async getCrewPerformance() {
    const { data } = await apiClient.get("/analytics/crew-performance");
    return data;
  },
};
