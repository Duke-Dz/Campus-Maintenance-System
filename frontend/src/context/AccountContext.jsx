import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { userService } from "../services/userService";
import { loadProfilePreferences, normalizeAvatarPreset } from "../utils/profilePreferences";
import { themeStorage } from "../utils/storage";
import { AccountContext } from "./account-context";

const REDUCE_MOTION_KEY = "campusfix-reduce-motion";
const COLLAPSED_KEY = "campusfix-sidebar-collapsed";
const migrationKeyFor = (username) => `scms.account.migrated.${(username || "guest").toLowerCase()}`;

const applyReduceMotionPreference = (enabled) => {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("reduce-motion", Boolean(enabled));
};

const dataUriToFile = async (dataUri, filename = "avatar.png") => {
  const response = await fetch(dataUri);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type || "image/png" });
};

export const AccountProvider = ({ children }) => {
  const { auth, isAuthenticated, updateAuth } = useAuth();
  const { setTheme } = useTheme();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const migrationStartedRef = useRef(false);

  const syncAccount = useCallback((nextAccount) => {
    if (!nextAccount) {
      setAccount(null);
      return null;
    }
    setAccount(nextAccount);
    updateAuth?.({ fullName: nextAccount?.identity?.fullName || auth?.fullName });
    if (nextAccount?.preferences?.theme) {
      setTheme(nextAccount.preferences.theme);
    }
    applyReduceMotionPreference(nextAccount?.preferences?.reduceMotion);
    window.dispatchEvent(
      new CustomEvent("dashboard:sidebar-collapsed", {
        detail: { collapsed: Boolean(nextAccount?.preferences?.sidebarCollapsedDefault) },
      })
    );
    return nextAccount;
  }, [auth?.fullName, setTheme, updateAuth]);

  const refreshAccount = useCallback(async () => {
    if (!isAuthenticated) {
      setAccount(null);
      setError("");
      return null;
    }
    setLoading(true);
    try {
      const data = await userService.getMyProfile();
      setError("");
      return syncAccount(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load account details right now.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, syncAccount]);

  useEffect(() => {
    if (!isAuthenticated) {
      setAccount(null);
      setError("");
      migrationStartedRef.current = false;
      return;
    }
    refreshAccount().catch(() => {});
  }, [auth?.username, isAuthenticated, refreshAccount]);

  const updateProfile = useCallback(async (payload) => {
    const data = await userService.updateMyProfile(payload);
    return syncAccount(data);
  }, [syncAccount]);

  const updatePreferences = useCallback(async (payload) => {
    const preferences = await userService.updateMyPreferences(payload);
    setAccount((current) => (current ? { ...current, preferences } : current));
    if (preferences?.theme) {
      setTheme(preferences.theme);
    }
    applyReduceMotionPreference(preferences?.reduceMotion);
    window.dispatchEvent(
      new CustomEvent("dashboard:sidebar-collapsed", {
        detail: { collapsed: Boolean(preferences?.sidebarCollapsedDefault) },
      })
    );
    return preferences;
  }, [setTheme]);

  const updateNotificationPreferences = useCallback(async (items) => {
    const notifications = await userService.updateMyNotificationPreferences(items);
    setAccount((current) => (current ? { ...current, notifications } : current));
    return notifications;
  }, []);

  const uploadAvatar = useCallback(async ({ file, avatarType = "preset", avatarPreset = "identicon" } = {}) => {
    const data = await userService.uploadAvatar({ file, avatarType, avatarPreset: normalizeAvatarPreset(avatarPreset) });
    return syncAccount(data);
  }, [syncAccount]);

  const deleteAvatar = useCallback(async () => {
    const data = await userService.deleteAvatar();
    return syncAccount(data);
  }, [syncAccount]);

  const changePassword = useCallback(async (payload) => userService.changePassword(payload), []);

  const revokeSession = useCallback(async (sessionId) => {
    await userService.revokeSession(sessionId);
    return refreshAccount();
  }, [refreshAccount]);

  const revokeOtherSessions = useCallback(async () => {
    await userService.revokeOtherSessions();
    return refreshAccount();
  }, [refreshAccount]);

  const updateManagedAccount = useCallback(async (userId, payload) => userService.updateManagedAccount(userId, payload), []);

  useEffect(() => {
    if (!account || !auth?.username || migrationStartedRef.current) {
      return;
    }
    migrationStartedRef.current = true;

    const runMigration = async () => {
      try {
        const migrationKey = migrationKeyFor(auth.username);
        if (localStorage.getItem(migrationKey) === "true") {
          return;
        }

        const legacyAvatar = loadProfilePreferences(auth.username);
        const legacyTheme = themeStorage.get();
        const legacyReduceMotion = localStorage.getItem(REDUCE_MOTION_KEY) === "true";
        const legacyCollapsedDefault = localStorage.getItem(COLLAPSED_KEY) === "true";
        const preferencePatch = {};

        if (legacyTheme && legacyTheme !== account?.preferences?.theme) {
          preferencePatch.theme = legacyTheme;
        }
        if (legacyReduceMotion !== Boolean(account?.preferences?.reduceMotion)) {
          preferencePatch.reduceMotion = legacyReduceMotion;
        }
        if (legacyCollapsedDefault !== Boolean(account?.preferences?.sidebarCollapsedDefault)) {
          preferencePatch.sidebarCollapsedDefault = legacyCollapsedDefault;
        }
        if (Object.keys(preferencePatch).length > 0) {
          await updatePreferences(preferencePatch);
        }

        if (legacyAvatar?.avatarType === "upload" && legacyAvatar?.avatarImage?.startsWith("data:")) {
          const avatarFile = await dataUriToFile(legacyAvatar.avatarImage);
          await uploadAvatar({ file: avatarFile, avatarType: "upload", avatarPreset: legacyAvatar.avatarPreset });
        } else if (legacyAvatar?.avatarPreset && legacyAvatar.avatarPreset !== account?.identity?.avatar?.avatarPreset) {
          await uploadAvatar({ avatarType: "preset", avatarPreset: legacyAvatar.avatarPreset });
        }

        localStorage.setItem(migrationKey, "true");
      } catch {
        // Ignore legacy migration failures and continue with backend-backed settings.
      }
    };

    runMigration();
  }, [account, auth?.username, updatePreferences, uploadAvatar]);

  const value = useMemo(
    () => ({
      account,
      loading,
      error,
      refreshAccount,
      updateProfile,
      updatePreferences,
      updateNotificationPreferences,
      uploadAvatar,
      deleteAvatar,
      changePassword,
      revokeSession,
      revokeOtherSessions,
      updateManagedAccount,
    }),
    [
      account,
      loading,
      error,
      refreshAccount,
      updateProfile,
      updatePreferences,
      updateNotificationPreferences,
      uploadAvatar,
      deleteAvatar,
      changePassword,
      revokeSession,
      revokeOtherSessions,
      updateManagedAccount,
    ]
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
};

