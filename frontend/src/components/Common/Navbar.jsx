import { LogOut, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../context/ThemeContext";
import { titleCase } from "../../utils/helpers";

export const Navbar = () => {
  const { auth, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mint">Smart Campus Ops</p>
          <h1 className="text-lg font-semibold text-ink dark:text-slate-100">Maintenance Control Hub</h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200 sm:inline-flex">
            {titleCase(auth?.role)}
          </span>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-ink dark:text-slate-100">{auth?.fullName || auth?.username}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">@{auth?.username}</p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
