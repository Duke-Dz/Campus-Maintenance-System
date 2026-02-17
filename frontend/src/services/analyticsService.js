import API from "./api";

export const getTicketStats = async () => {
  const res = await API.get("/analytics/stats");
  return res.data;
};

