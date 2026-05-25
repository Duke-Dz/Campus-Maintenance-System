import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, RefreshCcw } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { AuthShell } from "../components/Auth/AuthShell.jsx";
import { OtpCodeField } from "../components/Auth/OtpCodeField.jsx";
import { TurnstileWidget } from "../components/Auth/TurnstileWidget.jsx";
import { turnstileEnabled } from "../components/Auth/turnstileConfig.js";
import { authService } from "../services/authService";

const verifySchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  code: z.string().trim().length(6, "Enter the 6-digit verification code."),
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
  const initialEmail = searchParams.get("email") || "";
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [resending, setResending] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      email: initialEmail,
      code: "",
    },
  });
  const codeValue = watch("code");

  const verifyCode = async (values) => {
    setSubmitError("");
    setSuccessMessage("");
    setNotice("");
    try {
      const response = await authService.verifyEmail(values.email.trim(), values.code.trim());
      setSuccessMessage(response?.message || "Email verified successfully.");
      window.setTimeout(() => navigate("/login", { replace: true }), 1400);
    } catch (error) {
      setSubmitError(error?.response?.data?.message || error?.message || "Verification failed.");
    }
  };

  const resendCode = async () => {
    setSubmitError("");
    setSuccessMessage("");
    setNotice("");

    const email = getValues("email");
    if (!email?.trim()) {
      setSubmitError("Enter your email address first.");
      return;
    }
    if (turnstileEnabled && !captchaToken) {
      setSubmitError("Complete the verification challenge before requesting a new code.");
      return;
    }

    setResending(true);
    try {
      const response = await authService.resendVerification({
        email: email.trim(),
        captchaToken,
      });
      setNotice(response?.message || "If a pending registration exists, a new verification code has been sent.");
      setCaptchaToken("");
      setValue("code", "");
    } catch (error) {
      setSubmitError(error?.response?.data?.message || error?.message || "Unable to resend the verification code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell
      heading="Check your email"
      description="Enter the 6-digit verification code from your inbox to activate your account and continue."
      layout="single"
      showHeaderBrand
      headerBrandSubtitle="Campus Maintenance System"
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
      <form onSubmit={handleSubmit(verifyCode)} className="space-y-5">
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

        <OtpCodeField
          label="Verification code"
          value={codeValue}
          onChange={(value) => setValue("code", value, { shouldValidate: true, shouldDirty: true })}
          length={6}
          error={errors.code?.message}
        />

        <div className="rounded-[1.35rem] border border-slate-200 bg-white/90 px-4 py-4 dark:border-slate-700 dark:bg-slate-950/80">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Didn&apos;t receive a code?</p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                Request a new one if it expired or never arrived.
              </p>
            </div>
            <button
              type="button"
              onClick={resendCode}
              disabled={resending}
              className="inline-flex items-center justify-center gap-2 rounded-[1rem] border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-campus-300 hover:text-campus-700 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-campus-500 dark:hover:text-campus-200"
            >
              <RefreshCcw size={14} />
              {resending ? "Sending..." : "Resend code"}
            </button>
          </div>
          {turnstileEnabled ? (
            <div className="mt-3">
              <TurnstileWidget onVerify={(token) => setCaptchaToken(token || "")} />
            </div>
          ) : null}
        </div>

        {submitError ? <div className="rounded-[1.35rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">{submitError}</div> : null}
        {notice ? <div className="rounded-[1.35rem] border border-campus-200 bg-campus-50 px-4 py-3 text-sm font-medium text-campus-700 dark:border-campus-500/30 dark:bg-campus-500/10 dark:text-campus-200">{notice}</div> : null}
        {successMessage ? <div className="rounded-[1.35rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">{successMessage}</div> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-[1.35rem] bg-[linear-gradient(135deg,#102033,#1d63ed)] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_20px_40px_-24px_rgba(16,32,51,0.55)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <CheckCircle2 size={16} />
          {isSubmitting ? "Verifying..." : "Verify code"}
        </button>
      </form>
    </AuthShell>
  );
};
