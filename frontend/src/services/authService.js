import api from "./api";
import { setToken, setRole, clear } from "../utils/authStorage";

export const authService = {
  login(credentials) {
    return api.post("/auth/login", credentials, {
      headers: { "Content-Type": "application/json" },
    }).then((res) => {
      const { token, role } = res.data;
      setToken(token);
      setRole(role);
      return res.data;
    });
  },
  logout() {
    clear();
  },
};
