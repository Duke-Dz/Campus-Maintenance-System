const TOKEN_KEY = "token";
const ROLE_KEY = "role";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getRole = () => localStorage.getItem(ROLE_KEY);

export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const setRole = (role) => localStorage.setItem(ROLE_KEY, role);
export const clear = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
};