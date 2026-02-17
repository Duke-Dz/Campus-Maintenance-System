import api from "./api";

export const createTicket = (ticketData) => {
  return api.post("/tickets", ticketData).then((res) => res.data);
};

export const getMyTickets = () => {
  return api.get("/tickets/my").then((res) => res.data);
};

export const getAllTickets = () => {
  return api.get("/tickets").then((res) => res.data);
};

export const getAssignedTickets = () => {
  return api.get("/tickets/assigned").then((res) => res.data);
};

export const updateTicketStatus = (ticketId, status) => {
  return api.put(`/tickets/${ticketId}`, { status }).then((res) => res.data);
};

const ticketService = {
  createTicket,
  getMyTickets,
  getAllTickets,
  getAssignedTickets,
  updateTicketStatus,
};

export default ticketService;