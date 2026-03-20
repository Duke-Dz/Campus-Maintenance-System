import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Link2, Mail, RefreshCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { AuthShell } from "../components/Auth/AuthShell.jsx";
import { TurnstileWidget } from "../components/Auth/TurnstileWidget.jsx";
import { turnstileEnabled } from "../components/Auth/turnstileConfig.js";
import { authService } from "../services/authService";

const verifySchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

const fieldClass = (hasError) =>
  `mt-2 w-full rounded-[1.35rem] border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 dark:bg-slate-950 dark:text-white ${
    hasError
      ? "border-rose-300 ring-4 ring-rose-100/80 dark:border-rose-500/60 dark:ring-rose-500/10"
      : "border-slate-200 hover:border-campus-300 focus:border-campus-500 focus:ring-4 focus:ring-campus-100/80 dark:border-slate-700 dark:hover:border-campus-500/70 dark:focus:ring-campus-500/10"
  }`;

export const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const verificationToken = searchParams.get("token") || "";
  const initialEmail = searchParams.get("email") || "";
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [resending, setResending] = useState(false);
  const [verifyingToken, setVerifyingToken] = useState(Boolean(verificationToken));

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      email: initialEmail,
    },
  });

  useEffect(() => {
    if (!verificationToken) {
      setVerifyingToken(false);
      return undefined;
    }

    let cancelled = false;
    setSubmitError("");
    setSuccessMessage("");
    setNotice("");
    setVerifyingToken(true);

    authService
      .verifyEmail(verificationToken)
      .then((response) => {
        if (cancelled) {
          return;
        }
        setSuccessMessage(response?.message || "Email verified successfully.");
        window.setTimeout(() => navigate("/login", { replace: true }), 1400);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }
        setSubmitError(error?.response?.data?.message || error?.message || "Verification failed.");
      })
      .finally(() => {
        if (!cancelled) {
          setVerifyingToken(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [navigate, verificationToken]);

  const verificationDescription = useMemo(() => {
    if (verificationToken) {
      return "We detected a secure verification link and are checking it now.";
    }
    if (initialEmail) {
      return `We sent a verification link to ${initialEmail}. Open it from your inbox, or request a fresh link below.`;
    }
    return "Open the verification link from your email, or request a fresh link below.";
  }, [initialEmail, verificationToken]);

  const resendLink = async () => {
    setSubmitError("");
    setSuccessMessage("");
    setNotice("");

    const email = getValues("email");
    if (!email?.trim()) {
      setSubmitError("Enter your email address first.");
      return;
    }
    if (turnstileEnabled && !captchaToken) {
      setSubmitError("Complete the verification challenge before requesting a new link.");
      return;
    }

    setResending(true);
    try {
      const response = await authService.resendVerification({
        email: email.trim(),
        captchaToken,
      });
      setNotice(response?.message || "If a pending registration exists, a new verification link has been sent.");
      setCaptchaToken("");
    } catch (error) {
      setSubmitError(error?.response?.data?.message || error?.message || "Unable to resend the verification link.");
    } finally {
      setResending(false);
    }
  };

  const resendButton = (
    <button
      type="submit"
      disabled={resending || verifyingToken}
      className="inline-flex w-full items-center justify-center gap-2 rounded-[1.35rem] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-campus-300 hover:text-campus-700 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-campus-500 dark:hover:text-campus-200"
    >
      <RefreshCcw size={16} />
      {resending ? "Sending..." : "Resend verification link"}
    </button>
  );

  const verifyAside = (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <Mail size={16} className="text-campus-700 dark:text-campus-300" />
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Need a fresh link?</p>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Request a new verification link if the old one expired or never arrived. Verification is required before your first sign-in.
        </p>
      </div>
      <TurnstileWidget onVerify={(token) => setCaptchaToken(token || "")} />
      <div className="hidden lg:block">{resendButton}</div>
    </div>
  );

  return (
    <AuthShell
      sectionLabel="Verify email"
      heading="Verify your email"
      description={verificationDescription}
      aside={verifyAside}
      taskIcon={Mail}
      documentTitle="Verify email"
      footer={(
        <div className="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between">
          <p>Already verified?</p>
          <Link to="/login" className="font-semibold text-campus-700 no-underline hover:text-campus-800 dark:text-campus-300 dark:hover:text-campus-200">
            Return to sign in
          </Link>
        </div>
      )}
    >
      <form onSubmit={handleSubmit(resendLink)} className="space-y-5">
        {verificationToken ? (
          <div className="rounded-[1.35rem] border border-campus-200 bg-campus-50 px-4 py-3 text-sm font-medium text-campus-700 dark:border-campus-500/30 dark:bg-campus-500/10 dark:text-campus-200">
            <div className="flex items-center gap-2">
              <Link2 size={16} />
              <span>{verifyingToken ? "Verifying your secure link..." : "Secure verification link detected."}</span>
            </div>
          </div>
        ) : null}

        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Email</span>
          <input
            {...register("email")}
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="you@example.com"
            className={fieldClass(Boolean(errors.email))}
          />
          {errors.email ? <p className="mt-2 text-sm font-medium text-rose-600 dark:text-rose-300">{errors.email.message}</p> : null}
        </label>

        <div className="lg:hidden">{resendButton}</div>

        {submitError ? <div className="rounded-[1.35rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">{submitError}</div> : null}
        {notice ? <div className="rounded-[1.35rem] border border-campus-200 bg-campus-50 px-4 py-3 text-sm font-medium text-campus-700 dark:border-campus-500/30 dark:bg-campus-500/10 dark:text-campus-200">{notice}</div> : null}
        {successMessage ? <div className="rounded-[1.35rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">{successMessage}</div> : null}

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="inline-flex w-full items-center justify-center gap-2 rounded-[1.35rem] bg-[linear-gradient(135deg,#102033,#1d63ed)] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_20px_40px_-24px_rgba(16,32,51,0.55)] transition hover:-translate-y-0.5"
        >
          <CheckCircle2 size={16} />
          Return to sign in
        </button>
      </form>
    </AuthShell>
  );
};
