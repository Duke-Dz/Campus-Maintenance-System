import { Eye, EyeOff, Wrench, Zap, Shield, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROLES } from "../utils/constants";

const destination = (role) => {
  if (role === ROLES.ADMIN) return "/admin";
  if (role === ROLES.MAINTENANCE) return "/maintenance";
  return "/student";
};

/* ---- Animated Logo ---- */
const CampusFixLogo = () => (
  <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
    {/* Outer dashed ring */}
    <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-campus-300/60 dark:border-campus-500/30 animate-spin-slow" />
    {/* Glow ring */}
    <div className="absolute inset-1 rounded-xl bg-campus-400/10 dark:bg-campus-500/10 animate-pulse-ring" />
    {/* Inner icon */}
    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-campus-500 to-campus-700 shadow-lg shadow-campus-500/30">
      <Wrench size={28} className="text-white animate-spin-reverse" style={{ animationDuration: "8s" }} />
    </div>
    {/* Satellites */}
    <div className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 shadow-sm">
      <Zap size={12} className="text-white" />
    </div>
    <div className="absolute -bottom-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 shadow-sm">
      <Shield size={10} className="text-white" />
    </div>
  </div>
);

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const auth = await login(form);
      navigate(destination(auth.role), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-campus-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-campus-950" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(59,130,246,0.15),_transparent_50%),radial-gradient(circle_at_80%_70%,_rgba(99,102,241,0.1),_transparent_50%)]" />
      {/* Floating shapes */}
      <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-campus-400/10 blur-3xl" />
      <div className="absolute bottom-20 right-10 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl" />

      <form
        onSubmit={submit}
        className="relative z-10 w-full max-w-md animate-soft-rise rounded-3xl border border-white/60 bg-white/90 p-8 shadow-panel backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/85"
      >
        {/* Logo + Branding */}
        <CampusFixLogo />
        <h1 className="mt-5 text-center text-2xl font-bold text-gray-900 dark:text-white">
          Welcome to Campus<span className="text-campus-500">Fix</span>
        </h1>
        <p className="mt-1.5 text-center text-sm text-gray-500 dark:text-gray-400">
          Sign in to manage campus maintenance
        </p>

        {/* Username */}
        <label className="mt-6 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
          Username
        </label>
        <input
          value={form.username}
          onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
          className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:border-campus-400 focus:ring-2 focus:ring-campus-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-campus-500 dark:focus:ring-campus-900/30"
          placeholder="Enter your username"
          required
        />

        {/* Password */}
        <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
          Password
        </label>
        <div className="mt-1.5 flex rounded-xl border border-gray-200 bg-white transition-all duration-200 focus-within:border-campus-400 focus-within:ring-2 focus-within:ring-campus-100 dark:border-slate-700 dark:bg-slate-800 dark:focus-within:border-campus-500 dark:focus-within:ring-campus-900/30">
          <input
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            type={showPassword ? "text" : "password"}
            className="w-full rounded-l-xl bg-transparent px-4 py-2.5 text-sm outline-none dark:text-white"
            placeholder="Enter your password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="rounded-r-xl px-3 text-gray-400 transition hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Forgot */}
        <div className="mt-3 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <input type="checkbox" className="rounded border-gray-300 text-campus-500 focus:ring-campus-400 dark:border-slate-600" />
            Remember me
          </label>
          <button type="button" className="text-sm font-semibold text-campus-500 transition hover:text-campus-600">
            Forgot password?
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          disabled={loading}
          type="submit"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-campus-500 to-campus-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-campus-500/25 transition-all duration-200 hover:from-campus-600 hover:to-campus-700 hover:shadow-campus-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <ChevronRight size={16} />
            </>
          )}
        </button>

        {/* Register link */}
        <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
          New to CampusFix?{" "}
          <Link to="/register" className="font-semibold text-campus-500 transition hover:text-campus-600 hover:underline">
            Create account
          </Link>
        </p>

        {/* Footer */}
        <div className="mt-6 border-t border-gray-100 pt-4 dark:border-slate-700/50">
          <p className="text-center text-[11px] text-gray-400 dark:text-gray-500">
            Smart Campus Maintenance System · CampusFix v1.0
          </p>
        </div>
      </form>
    </div>
  );
};
