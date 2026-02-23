import { useCallback, useEffect, useMemo, useState } from "react";
import { authService } from "../services/authService";
import { authStorage } from "../utils/storage";
import { ROLES } from "../utils/constants";
import { AuthContext } from "./auth-context";

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

  const login = useCallback(async (payload) => {
    const data = await authService.login(payload).catch((error) => {
      throw new Error(parseError(error));
    });
    const next = normalizeAuth(data);
    setAuth(next);
    authStorage.set(next);
    return next;
  }, []);

  const register = useCallback(async (payload) => {
    return authService.register(payload).catch((error) => {
      throw new Error(parseError(error));
    });
  }, []);

  const logout = useCallback(() => {
    authStorage.clear();
    setAuth(null);
  }, []);

  const updateAuth = useCallback((partial) => {
    if (!partial || typeof partial !== "object") return;
    setAuth((current) => {
      if (!current) return current;
      const next = { ...current, ...partial };
      authStorage.set(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      auth,
      isAuthenticated: Boolean(auth?.token),
      homePath: roleHome(auth?.role),
      login,
      register,
      logout,
      updateAuth,
    }),
    [auth, login, logout, register, updateAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
