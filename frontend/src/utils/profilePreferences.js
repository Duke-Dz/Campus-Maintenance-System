const PROFILE_STORAGE_PREFIX = "scms.profile.";

export const AVATAR_PRESETS = [
  { id: "campus", label: "Campus Blue", classes: "from-campus-500 to-campus-700" },
  { id: "aurora", label: "Aurora", classes: "from-emerald-400 to-cyan-500" },
  { id: "sunrise", label: "Sunrise", classes: "from-orange-400 to-rose-500" },
  { id: "violet", label: "Violet", classes: "from-indigo-500 to-purple-600" },
  { id: "slate", label: "Slate", classes: "from-slate-500 to-slate-700" },
  { id: "amber", label: "Amber", classes: "from-amber-400 to-orange-600" },
];

const defaultPrefs = {
  avatarType: "preset",
  avatarPreset: "campus",
  avatarImage: "",
};

const keyFor = (username) => `${PROFILE_STORAGE_PREFIX}${(username || "guest").toLowerCase()}`;

export const loadProfilePreferences = (username) => {
  if (!username) return defaultPrefs;
  try {
    const raw = localStorage.getItem(keyFor(username));
    if (!raw) return defaultPrefs;
    const parsed = JSON.parse(raw);
    return {
      avatarType: parsed.avatarType === "upload" ? "upload" : "preset",
      avatarPreset: AVATAR_PRESETS.some((preset) => preset.id === parsed.avatarPreset)
        ? parsed.avatarPreset
        : defaultPrefs.avatarPreset,
      avatarImage: typeof parsed.avatarImage === "string" ? parsed.avatarImage : "",
    };
  } catch {
    return defaultPrefs;
  }
};

export const saveProfilePreferences = (username, prefs) => {
  if (!username) return;
  const payload = {
    avatarType: prefs?.avatarType === "upload" ? "upload" : "preset",
    avatarPreset: AVATAR_PRESETS.some((preset) => preset.id === prefs?.avatarPreset)
      ? prefs.avatarPreset
      : defaultPrefs.avatarPreset,
    avatarImage: typeof prefs?.avatarImage === "string" ? prefs.avatarImage : "",
  };
  try {
    localStorage.setItem(keyFor(username), JSON.stringify(payload));
  } catch {
    // ignore storage limitations
  }
};

export const resolveAvatarPreset = (presetId) =>
  AVATAR_PRESETS.find((preset) => preset.id === presetId) || AVATAR_PRESETS[0];
