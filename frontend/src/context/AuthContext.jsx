import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { authService } from "../services/authService";
import { configureApiClientAuth } from "../services/apiClient";
import { ROLES } from "../utils/constants";
import { AuthContext } from "./auth-context";

const roleHome = (role) => {
  if (role === ROLES.ADMIN) return "/admin";
  if (role === ROLES.MAINTENANCE) return "/maintenance";
  return "/student";
};

const normalizeSession = (data) => ({
  accessToken: data.accessToken,
  expiresAt: data.expiresAt,
  username: data.username,
  fullName: data.fullName,
  role: data.role,
});

const isMfaChallenge = (data) => Boolean(data?.mfaRequired && data?.mfaChallengeId);

const parseError = (error, fallback = "Request failed. Please try again.") =>
  error?.response?.data?.message || error?.message || fallback;

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const refreshTimerRef = useRef(null);
  const authRef = useRef(auth);

  useEffect(() => {
    authRef.current = auth;
  }, [auth]);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const clearSession = useCallback(() => {
    clearRefreshTimer();
    setAuth(null);
  }, [clearRefreshTimer]);

  const refreshSession = useCallback(async () => {
    const data = await authService.refresh();
    const next = normalizeSession(data);
    setAuth(next);
    return next;
  }, []);

  const login = useCallback(async (payload) => {
    try {
      const data = await authService.login(payload);
      if (isMfaChallenge(data)) {
        return {
          mfaRequired: true,
          mfaChallengeId: data.mfaChallengeId,
          message: data.message || "Enter the sign-in code sent to your email.",
          username: data.username,
          fullName: data.fullName,
          role: data.role,
        };
      }
      if (!data?.accessToken) {
        throw new Error("Unable to sign in.");
      }
      const next = normalizeSession(data);
      setAuth(next);
      return next;
    } catch (error) {
      throw new Error(parseError(error, "Unable to sign in."));
    }
  }, []);

  const register = useCallback(async (payload) => {
    try {
      return await authService.register(payload);
    } catch (error) {
      throw new Error(parseError(error, "Unable to create your account."));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Best-effort logout. Client state must still be cleared.
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const updateAuth = useCallback((partial) => {
    if (!partial || typeof partial !== "object") return;
    setAuth((current) => (current ? { ...current, ...partial } : current));
  }, []);

  useEffect(() => {
    configureApiClientAuth({
      accessTokenGetter: () => authRef.current?.accessToken || null,
      refreshSession: async () => {
        try {
          return await refreshSession();
        } catch {
          clearSession();
          throw new Error("Unable to refresh session.");
        }
      },
      clearSession,
    });
  }, [clearSession, refreshSession]);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        await refreshSession();
      } catch {
        if (!cancelled) {
          clearSession();
        }
      } finally {
        if (!cancelled) {
          setInitializing(false);
        }
      }
    };

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [clearSession, refreshSession]);

  useEffect(() => {
    clearRefreshTimer();
    if (!auth?.expiresAt) {
      return;
    }

    const expiresAtMs = new Date(auth.expiresAt).getTime();
    if (Number.isNaN(expiresAtMs)) {
      return;
    }
    const refreshAtMs = expiresAtMs - 60_000;
    const delayMs = refreshAtMs - Date.now();
    if (delayMs <= 0) {
      refreshSession().catch(() => clearSession());
      return;
    }

    refreshTimerRef.current = setTimeout(() => {
      refreshSession().catch(() => clearSession());
    }, delayMs);

    return clearRefreshTimer;
  }, [auth?.expiresAt, clearRefreshTimer, clearSession, refreshSession]);

  const value = useMemo(
    () => ({
      auth,
      initializing,
      isAuthenticated: Boolean(auth?.accessToken),
      homePath: roleHome(auth?.role),
      login,
      register,
      logout,
      refreshSession,
      updateAuth,
    }),
    [auth, initializing, login, logout, refreshSession, register, updateAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
