import api from "./api";

export const userService = {
  getUsers() {
    return api.get("/admin/users").then((res) => res.data);
  },
  updateRole(userId, role) {
    return api.patch(`/admin/users/${userId}/role?role=${role}`).then((res) => res.data);
  },
  setActive(userId, enabled) {
    return api.patch(`/admin/users/${userId}/active?enabled=${enabled}`).then((res) => res.data);
  },
};
