import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, KeyRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { AuthPasswordField } from "../components/Auth/AuthPasswordField.jsx";
import { OtpCodeField } from "../components/Auth/OtpCodeField.jsx";
import { AuthShell } from "../components/Auth/AuthShell.jsx";
import { useAuth } from "../hooks/useAuth";
import { authService } from "../services/authService";
import { ROLES } from "../utils/constants";

const loginSchema = z.object({
  username: z.string().trim().min(3, "Enter your username."),
  password: z.string().min(1, "Enter your password."),
});

const destination = (role) => {
  if (role === ROLES.ADMIN) return "/admin";
  if (role === ROLES.MAINTENANCE) return "/maintenance";
  return "/student";
};

const fieldClass = (hasError) =>
  `mt-2 w-full rounded-[1.35rem] border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 dark:bg-slate-950 dark:text-white ${
    hasError
      ? "border-rose-300 ring-4 ring-rose-100/80 dark:border-rose-500/60 dark:ring-rose-500/10"
      : "border-slate-200 hover:border-campus-300 focus:border-campus-500 focus:ring-4 focus:ring-campus-100/80 dark:border-slate-700 dark:hover:border-campus-500/70 dark:focus:ring-campus-500/10"
  }`;

export const LoginPage = () => {
  const { login, refreshSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitError, setSubmitError] = useState("");
  const [mfaChallengeId, setMfaChallengeId] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaMessage, setMfaMessage] = useState("");
  const [mfaError, setMfaError] = useState("");
  const [mfaSubmitting, setMfaSubmitting] = useState(false);
  const [mfaResending, setMfaResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values) => {
    setSubmitError("");
    setMfaError("");
    try {
      const session = await login({
        username: values.username.trim(),
        password: values.password,
      });
      if (session?.mfaRequired) {
        setMfaChallengeId(session.mfaChallengeId);
        setMfaCode("");
        setMfaMessage(session.message || "Enter the sign-in code sent to your email.");
        return;
      }
      const nextPath = location.state?.from?.pathname || destination(session.role);
      navigate(nextPath, { replace: true });
    } catch (error) {
      setSubmitError(error.message);
    }
  };

  const verifyMfa = async () => {
    if (!mfaChallengeId) return;
    if (!mfaCode.trim()) {
      setMfaError("Enter the sign-in code.");
      return;
    }
    setMfaError("");
    setMfaSubmitting(true);
    try {
      await authService.verifyMfa(mfaChallengeId, mfaCode.trim());
      const session = await refreshSession();
      const nextPath = location.state?.from?.pathname || destination(session.role);
      navigate(nextPath, { replace: true });
    } catch (error) {
      setMfaError(error?.response?.data?.message || error?.message || "Unable to verify sign-in code.");
    } finally {
      setMfaSubmitting(false);
    }
  };

  const resendMfa = async () => {
    if (!mfaChallengeId) return;
    setMfaError("");
    setMfaResending(true);
    try {
      const response = await authService.resendMfa(mfaChallengeId);
      setMfaMessage(response?.message || "If the challenge is still valid, a new code has been sent.");
    } catch (error) {
      setMfaError(error?.response?.data?.message || error?.message || "Unable to resend sign-in code.");
    } finally {
      setMfaResending(false);
    }
  };

  const resetMfaFlow = () => {
    setMfaChallengeId("");
    setMfaCode("");
    setMfaMessage("");
    setMfaError("");
  };

  return (
    <AuthShell
      sectionLabel="Sign in"
      heading="Sign in to CampusFix"
      description="Use your username and password to continue."
      layout="single"
      documentTitle="Sign in"
      footer={(
        <div className="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between">
          <p>New to CampusFix?</p>
          <Link to="/register" className="font-semibold text-campus-700 no-underline hover:text-campus-800 dark:text-campus-300 dark:hover:text-campus-200">
            Create an account
          </Link>
        </div>
      )}
    >
      {mfaChallengeId ? (
        <div className="space-y-5">
          {mfaMessage ? (
            <div className="rounded-[1.35rem] border border-campus-200 bg-campus-50 px-4 py-3 text-sm font-medium text-campus-700 dark:border-campus-500/30 dark:bg-campus-500/10 dark:text-campus-200">
              {mfaMessage}
            </div>
          ) : null}

          <OtpCodeField
            label="Sign-in code"
            value={mfaCode}
            onChange={(value) => setMfaCode(value)}
            length={6}
            error={mfaError}
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={verifyMfa}
              disabled={mfaSubmitting}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-[1.35rem] bg-[linear-gradient(135deg,#102033,#1d63ed)] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_20px_40px_-24px_rgba(16,32,51,0.55)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <KeyRound size={16} />
              {mfaSubmitting ? "Verifying..." : "Verify code"}
            </button>
            <button
              type="button"
              onClick={resendMfa}
              disabled={mfaResending}
              className="btn-ghost interactive-control"
            >
              {mfaResending ? "Sending..." : "Resend code"}
            </button>
            <button
              type="button"
              onClick={resetMfaFlow}
              className="btn-ghost interactive-control"
            >
              Use different account
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Username</span>
            <input
              {...register("username")}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="Enter your username"
              className={fieldClass(Boolean(errors.username))}
            />
            {errors.username ? <p className="mt-2 text-sm font-medium text-rose-600 dark:text-rose-300">{errors.username.message}</p> : null}
          </label>

          <AuthPasswordField
            label="Password"
            error={errors.password?.message}
            registration={register("password")}
            autoComplete="current-password"
            placeholder="Enter your password"
          />

          <div className="flex items-center justify-between gap-3 text-sm">
            <p className="text-slate-500 dark:text-slate-400">Use the details assigned to your account.</p>
            <Link to="/forgot-password" className="font-semibold text-campus-700 no-underline hover:text-campus-800 dark:text-campus-300 dark:hover:text-campus-200">
              Forgot password?
            </Link>
          </div>

          <AnimatePresence mode="wait">
            {submitError ? (
              <Motion.div
                key="login-error"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="rounded-[1.35rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200"
              >
                {submitError}
              </Motion.div>
            ) : null}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-[1.35rem] bg-[linear-gradient(135deg,#102033,#1d63ed)] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_20px_40px_-24px_rgba(16,32,51,0.55)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <KeyRound size={16} />
            {isSubmitting ? "Signing in..." : "Sign in"}
            <ArrowRight size={16} />
          </button>
        </form>
      )}
    </AuthShell>
  );
};
