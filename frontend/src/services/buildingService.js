import apiClient from "./apiClient";

export const buildingService = {
  async getBuildings() {
    const { data } = await apiClient.get("/buildings");
    return Array.isArray(data) ? data : [];
  },
};
