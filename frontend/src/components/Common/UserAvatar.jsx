import { resolveAvatarPreset } from "../../utils/profilePreferences";

const initialFor = (fullName, username) => {
  const source = `${fullName || ""}`.trim() || `${username || ""}`.trim() || "U";
  return source.charAt(0).toUpperCase();
};

export const UserAvatar = ({
  fullName,
  username,
  avatarType = "preset",
  avatarPreset = "campus",
  avatarImage = "",
  size = 34,
  className = "",
}) => {
  const initial = initialFor(fullName, username);
  const preset = resolveAvatarPreset(avatarPreset);

  if (avatarType === "upload" && avatarImage) {
    return (
      <span
        className={`relative inline-flex shrink-0 overflow-hidden rounded-xl border border-white/25 bg-slate-100 dark:border-slate-700 dark:bg-slate-800 ${className}`}
        style={{ width: size, height: size }}
      >
        <img src={avatarImage} alt={`${fullName || username || "User"} avatar`} className="h-full w-full object-cover" />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${preset.classes} text-white shadow-sm shadow-campus-500/30 ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(12, Math.round(size * 0.42)) }}
      aria-hidden="true"
    >
      <span className="font-bold leading-none">{initial}</span>
    </span>
  );
};
