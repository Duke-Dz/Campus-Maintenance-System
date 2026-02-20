import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services/authService";
import { authStorage } from "../utils/storage";
import { ROLES } from "../utils/constants";

const AuthContext = createContext(null);

const roleHome = (role) => {
  if (role === ROLES.ADMIN) return "/admin";
  if (role === ROLES.MAINTENANCE) return "/maintenance";
  return "/student";
};

const normalizeAuth = (data) => ({
  token: data.token,
  username: data.username,
  fullName: data.fullName,
  role: data.role,
});

const parseError = (error) => error?.response?.data?.message || "Request failed. Please try again.";

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(authStorage.get());

  useEffect(() => {
    const onUnauthorized = () => {
      authStorage.clear();
      setAuth(null);
      window.location.href = "/";
    };
    window.addEventListener("auth:unauthorized", onUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", onUnauthorized);
  }, []);

  const login = async (payload) => {
    const data = await authService.login(payload).catch((error) => {
      throw new Error(parseError(error));
    });
    const next = normalizeAuth(data);
    setAuth(next);
    authStorage.set(next);
    return next;
  };

  const register = async (payload) => {
    const data = await authService.register(payload).catch((error) => {
      throw new Error(parseError(error));
    });
    const next = normalizeAuth(data);
    setAuth(next);
    authStorage.set(next);
    return next;
  };

  const logout = () => {
    authStorage.clear();
    setAuth(null);
  };

  const value = useMemo(
    () => ({
      auth,
      isAuthenticated: Boolean(auth?.token),
      homePath: roleHome(auth?.role),
      login,
      register,
      logout,
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
