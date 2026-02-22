import { Eye, EyeOff, Wrench, Zap, Shield, ChevronRight, ArrowLeft, Mail, Loader2, KeyRound, RefreshCcw, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROLES } from "../utils/constants";
import { authService } from "../services/authService";

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

/* ---- Glassy Footer ---- */
const SimpleFooter = () => (
  <p className="relative z-10 pb-6 text-center text-[11px] font-medium tracking-wide text-gray-600 dark:text-gray-500">
    © {new Date().getFullYear()} CampusFix Systems
  </p>
);

/* ---- Auth Page Background ---- */
const AuthBackground = ({ children }) => (
  <div className="relative flex min-h-screen flex-col overflow-hidden">
    {/* Background */}
    <div className="absolute inset-0 bg-gradient-to-br from-campus-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-campus-950" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(59,130,246,0.15),_transparent_50%),radial-gradient(circle_at_80%_70%,_rgba(99,102,241,0.1),_transparent_50%)]" />
    {/* Floating shapes */}
    <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-campus-400/10 blur-3xl" />
    <div className="absolute bottom-20 right-10 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl" />
    {/* Main content — centered */}
    <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
      {children}
    </div>
    {/* Footer — bottom */}
    <SimpleFooter />
  </div>
);

/* ==================================================================== */
/*  LOGIN PAGE                                                          */
/* ==================================================================== */
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
    <AuthBackground>
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
          Sign in to access your dashboard
        </p>

        {/* Username */}
        <label className="mt-6 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-700 dark:text-gray-300">
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
        <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-700 dark:text-gray-300">
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

        {/* Remember + Forgot */}
        <div className="mt-3 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" className="rounded border-gray-300 text-campus-500 focus:ring-campus-400 dark:border-slate-600" />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-sm font-semibold text-campus-500 transition hover:text-campus-600">
            Forgot password?
          </Link>
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
        <p className="mt-5 text-center text-sm text-gray-700 dark:text-gray-300">
          New to CampusFix?{" "}
          <Link to="/register" className="font-semibold text-campus-500 transition hover:text-campus-600 hover:underline">
            Create account
          </Link>
        </p>
      </form>
    </AuthBackground>
  );
};

/* ==================================================================== */
/*  VERIFY EMAIL PAGE                                                   */
/* ==================================================================== */
export const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const initialEmail = new URLSearchParams(window.location.search).get("email") || "";
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [notice, setNotice] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setSuccess("");
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!/^\d{6}$/.test(code.trim())) {
      setError("Verification code must be 6 digits.");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.verifyEmail(email.trim(), code.trim());
      setSuccess(response?.message || "Email verified successfully.");
      setTimeout(() => navigate("/login", { replace: true }), 1800);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    setError("");
    setNotice("");
    setSuccess("");
    if (!email.trim()) {
      setError("Enter your email first.");
      return;
    }
    setResendLoading(true);
    try {
      const response = await authService.resendVerification(email.trim());
      setNotice(response?.message || "A new verification code has been sent.");
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to resend code.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthBackground>
      <form
        onSubmit={submit}
        className="relative z-10 w-full max-w-md animate-soft-rise rounded-3xl border border-white/60 bg-white/90 p-8 shadow-panel backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/85"
      >
        <CampusFixLogo />
        <h1 className="mt-5 text-center text-2xl font-bold text-gray-900 dark:text-white">
          Verify Your Email
        </h1>
        <p className="mt-1.5 text-center text-sm text-gray-700 dark:text-gray-300">
          Enter the 6-digit verification code sent to your inbox.
        </p>

        <label className="mt-6 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-700 dark:text-gray-300">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:border-campus-400 focus:ring-2 focus:ring-campus-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-campus-500 dark:focus:ring-campus-900/30"
          placeholder="Enter your email"
          required
        />

        <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-700 dark:text-gray-300">
          Verification Code
        </label>
        <div className="mt-1.5 flex rounded-xl border border-gray-200 bg-white transition-all duration-200 focus-within:border-campus-400 focus-within:ring-2 focus-within:ring-campus-100 dark:border-slate-700 dark:bg-slate-800 dark:focus-within:border-campus-500 dark:focus-within:ring-campus-900/30">
          <div className="flex items-center pl-4 text-gray-400">
            <KeyRound size={18} />
          </div>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="w-full bg-transparent px-3 py-2.5 text-sm tracking-[0.4em] outline-none dark:text-white"
            placeholder="000000"
            required
            inputMode="numeric"
            autoComplete="one-time-code"
          />
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </p>
        )}
        {notice && (
          <p className="mt-4 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
            {notice}
          </p>
        )}
        {success && (
          <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
            {success}
          </p>
        )}

        <button
          disabled={loading}
          type="submit"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-campus-500 to-campus-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-campus-500/25 transition-all duration-200 hover:from-campus-600 hover:to-campus-700 hover:shadow-campus-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Verifying...
            </>
          ) : (
            <>
              <CheckCircle2 size={16} />
              Verify Email
            </>
          )}
        </button>

        <button
          type="button"
          disabled={resendLoading}
          onClick={resendCode}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-campus-300 hover:text-campus-600 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200 dark:hover:border-campus-600 dark:hover:text-campus-300"
        >
          {resendLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Sending...
            </>
          ) : (
            <>
              <RefreshCcw size={16} />
              Resend Code
            </>
          )}
        </button>

        <p className="mt-5 text-center text-sm text-gray-700 dark:text-gray-300">
          Already verified?{" "}
          <Link to="/login" className="font-semibold text-campus-500 transition hover:text-campus-600 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthBackground>
  );
};

/* ==================================================================== */
/*  FORGOT PASSWORD PAGE                                                */
/* ==================================================================== */
export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBackground>
      <div className="relative z-10 w-full max-w-md animate-soft-rise rounded-3xl border border-white/60 bg-white/90 p-8 shadow-panel backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/85">
        <CampusFixLogo />

        {success ? (
          /* ---- Success State ---- */
          <div className="mt-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/30">
              <Mail size={28} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Check Your Email</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              We've sent a password reset link to <span className="font-semibold text-campus-600 dark:text-campus-400">{email}</span>.
              Check your inbox and follow the instructions.
            </p>
            <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
              Didn't receive it? Check your spam folder or try again.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={() => { setSuccess(false); setEmail(""); }}
                className="btn-ghost w-full justify-center"
              >
                Try a different email
              </button>
              <Link to="/login" className="btn-primary w-full justify-center no-underline">
                <ArrowLeft size={16} /> Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          /* ---- Form State ---- */
          <>
            <h1 className="mt-5 text-center text-2xl font-bold text-gray-900 dark:text-white">
              Forgot Password?
            </h1>
            <p className="mt-1.5 text-center text-sm text-gray-700 dark:text-gray-300">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={submit} className="mt-6">
              <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <div className="mt-1.5 flex rounded-xl border border-gray-200 bg-white transition-all duration-200 focus-within:border-campus-400 focus-within:ring-2 focus-within:ring-campus-100 dark:border-slate-700 dark:bg-slate-800 dark:focus-within:border-campus-500 dark:focus-within:ring-campus-900/30">
                <div className="flex items-center pl-4 text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent px-3 py-2.5 text-sm outline-none dark:text-white"
                  placeholder="Enter your email address"
                  required
                />
              </div>

              {error && (
                <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 dark:bg-red-900/20 dark:text-red-300">
                  {error}
                </p>
              )}

              <button
                disabled={loading}
                type="submit"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-campus-500 to-campus-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-campus-500/25 transition-all duration-200 hover:from-campus-600 hover:to-campus-700 hover:shadow-campus-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 text-center">
              <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold text-campus-500 transition hover:text-campus-600">
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </AuthBackground>
  );
};

/* ==================================================================== */
/*  RESET PASSWORD PAGE                                                 */
/* ==================================================================== */
export const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const previousReferrer = document.querySelector("meta[name='referrer']");
    const previousContent = previousReferrer?.getAttribute("content");
    const createdMeta = !previousReferrer;

    if (!previousReferrer) {
      const meta = document.createElement("meta");
      meta.setAttribute("name", "referrer");
      meta.setAttribute("content", "no-referrer");
      document.head.appendChild(meta);
    } else {
      previousReferrer.setAttribute("content", "no-referrer");
    }

    return () => {
      const currentReferrer = document.querySelector("meta[name='referrer']");
      if (createdMeta && currentReferrer) {
        currentReferrer.remove();
      } else if (currentReferrer && previousContent) {
        currentReferrer.setAttribute("content", previousContent);
      }
    };
  }, []);

  // Get token from URL
  const token = new URLSearchParams(window.location.search).get("token");

  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthBackground>
        <div className="relative z-10 w-full max-w-md animate-soft-rise rounded-3xl border border-white/60 bg-white/90 p-8 shadow-panel backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/85 text-center">
          <CampusFixLogo />
          <h2 className="mt-5 text-xl font-bold text-gray-900 dark:text-white">Invalid Reset Link</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link to="/forgot-password" className="btn-primary mt-6 w-full justify-center no-underline inline-flex">
            Request New Link
          </Link>
        </div>
      </AuthBackground>
    );
  }

  return (
    <AuthBackground>
      <div className="relative z-10 w-full max-w-md animate-soft-rise rounded-3xl border border-white/60 bg-white/90 p-8 shadow-panel backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/85">
        <CampusFixLogo />

        {success ? (
          <div className="mt-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/30">
              <Shield size={28} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Password Reset!</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Your password has been successfully updated. You can now sign in with your new password.
            </p>
            <Link to="/login" className="btn-primary mt-6 w-full justify-center no-underline inline-flex">
              Sign In Now
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mt-5 text-center text-2xl font-bold text-gray-900 dark:text-white">
              Set New Password
            </h1>
            <p className="mt-1.5 text-center text-sm text-gray-500 dark:text-gray-400">
              Enter your new password below.
            </p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
                  New Password
                </label>
                <div className="mt-1.5 flex rounded-xl border border-gray-200 bg-white transition-all duration-200 focus-within:border-campus-400 focus-within:ring-2 focus-within:ring-campus-100 dark:border-slate-700 dark:bg-slate-800 dark:focus-within:border-campus-500 dark:focus-within:ring-campus-900/30">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    className="w-full rounded-l-xl bg-transparent px-4 py-2.5 text-sm outline-none dark:text-white"
                    placeholder="Enter new password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="rounded-r-xl px-3 text-gray-400 transition hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
                  Confirm Password
                </label>
                <input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type="password"
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:border-campus-400 focus:ring-2 focus:ring-campus-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-campus-500 dark:focus:ring-campus-900/30"
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 dark:bg-red-900/20 dark:text-red-300">
                  {error}
                </p>
              )}

              <button
                disabled={loading}
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-campus-500 to-campus-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-campus-500/25 transition-all duration-200 hover:from-campus-600 hover:to-campus-700 hover:shadow-campus-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Updating...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </AuthBackground>
  );
};
