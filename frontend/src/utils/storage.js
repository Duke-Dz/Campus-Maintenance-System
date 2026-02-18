const AUTH_KEY = "scms.auth";
const THEME_KEY = "scms.theme";

export const authStorage = {
  get() {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      localStorage.removeItem(AUTH_KEY);
      return null;
    }
  },
  set(value) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(value));
  },
  clear() {
    localStorage.removeItem(AUTH_KEY);
  },
};

export const themeStorage = {
  get() {
    return localStorage.getItem(THEME_KEY) || "light";
  },
  set(value) {
    localStorage.setItem(THEME_KEY, value);
  },
};
