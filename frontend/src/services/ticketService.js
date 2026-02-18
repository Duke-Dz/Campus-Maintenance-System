import apiClient from "./apiClient";

const buildQuery = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, value);
    }
  });
  return search.toString();
};

export const ticketService = {
  async createTicket(payload, imageFile) {
    if (imageFile) {
      const formData = new FormData();
      formData.append("data", new Blob([JSON.stringify(payload)], { type: "application/json" }));
      formData.append("image", imageFile);
      const { data } = await apiClient.post("/tickets", formData);
      return data;
    }
    const { data } = await apiClient.post("/tickets", payload);
    return data;
  },

  async getMyTickets() {
    const { data } = await apiClient.get("/tickets/my");
    return data;
  },

  async getAssignedTickets() {
    const { data } = await apiClient.get("/tickets/assigned");
    return data;
  },

  async getAllTickets(filters) {
    const query = buildQuery({
      status: filters?.status,
      category: filters?.category,
      urgency: filters?.urgency,
      assignee: filters?.assignee,
      search: filters?.search,
    });
    const { data } = await apiClient.get(`/tickets${query ? `?${query}` : ""}`);
    return data;
  },

  async getTicket(ticketId) {
    const { data } = await apiClient.get(`/tickets/${ticketId}`);
    return data;
  },

  async updateStatus(ticketId, payload) {
    const { data } = await apiClient.patch(`/tickets/${ticketId}/status`, payload);
    return data;
  },

  async assignTicket(ticketId, payload) {
    const { data } = await apiClient.patch(`/tickets/${ticketId}/assign`, payload);
    return data;
  },

  async rateTicket(ticketId, payload) {
    const { data } = await apiClient.post(`/tickets/${ticketId}/rate`, payload);
    return data;
  },

  async getLogs(ticketId) {
    const { data } = await apiClient.get(`/tickets/${ticketId}/logs`);
    return data;
  },
};
