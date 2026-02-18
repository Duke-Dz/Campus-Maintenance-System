import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROLES } from "../utils/constants";

const destination = (role) => {
  if (role === ROLES.ADMIN) return "/admin";
  if (role === ROLES.MAINTENANCE) return "/maintenance";
  return "/student";
};

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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,168,149,0.2),_transparent_50%),radial-gradient(circle_at_bottom_right,_rgba(31,42,68,0.18),_transparent_40%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(0,168,149,0.25),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(241,245,249,0.1),_transparent_45%)]" />
      <form
        onSubmit={submit}
        className="relative z-10 w-full max-w-md animate-soft-rise rounded-3xl border border-white/60 bg-white/90 p-8 shadow-panel backdrop-blur dark:border-slate-700 dark:bg-slate-900/85"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-mint">Campus Maintenance</p>
        <h1 className="mt-2 text-2xl font-bold text-ink dark:text-slate-100">Welcome Back</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Sign in to access your dashboard.</p>

        <label className="mt-6 block text-sm font-medium text-slate-700 dark:text-slate-200">Username</label>
        <input
          value={form.username}
          onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-mint focus:ring-2 focus:ring-mint/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          placeholder="admin"
          required
        />

        <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-200">Password</label>
        <div className="mt-1 flex rounded-xl border border-slate-300 bg-white focus-within:border-mint focus-within:ring-2 focus-within:ring-mint/20 dark:border-slate-700 dark:bg-slate-950">
          <input
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            type={showPassword ? "text" : "password"}
            className="w-full rounded-l-xl bg-transparent px-3 py-2 text-sm outline-none dark:text-slate-100"
            placeholder="password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="rounded-r-xl px-3 text-slate-500 hover:text-slate-700 dark:text-slate-300"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{error}</p>}

        <button
          disabled={loading}
          type="submit"
          className="mt-6 w-full rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-mint dark:text-slate-950 dark:hover:bg-emerald-300"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-300">
          New student?{" "}
          <Link to="/register" className="font-semibold text-mint hover:underline">
            Create account
          </Link>
        </p>
      </form>
    </div>
  );
};
