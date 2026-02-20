import apiClient from "./apiClient";

export const supportService = {
  async submit(payload) {
    const { data } = await apiClient.post("/public/contact-support", payload);
    return data;
  },
};
