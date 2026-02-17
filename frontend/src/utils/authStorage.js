const TOKEN_KEY = "token";
const ROLE_KEY = "role";

// --- DEV MODE: ALWAYS RETURN TRUE ---
export const getToken = () => "fake-dev-token"; 
export const getRole = () => "ADMIN"; // Change this to "STUDENT" or "MAINTENANCE" to see other views

export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const setRole = (role) => localStorage.setItem(ROLE_KEY, role);
export const clear = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
};