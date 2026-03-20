import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Mail } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { AuthShell } from "../components/Auth/AuthShell.jsx";
import { TurnstileWidget } from "../components/Auth/TurnstileWidget.jsx";
import { turnstileEnabled } from "../components/Auth/turnstileConfig.js";
import { authService } from "../services/authService";

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  captchaToken: turnstileEnabled ? z.string().min(1, "Complete the verification challenge.") : z.string().optional(),
});

const fieldClass = (hasError) =>
  `mt-2 w-full rounded-[1.35rem] border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 dark:bg-slate-950 dark:text-white ${
    hasError
      ? "border-rose-300 ring-4 ring-rose-100/80 dark:border-rose-500/60 dark:ring-rose-500/10"
      : "border-slate-200 hover:border-campus-300 focus:border-campus-500 focus:ring-4 focus:ring-campus-100/80 dark:border-slate-700 dark:hover:border-campus-500/70 dark:focus:ring-campus-500/10"
  }`;

export const ForgotPasswordPage = () => {
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
      captchaToken: "",
    },
  });

  const emailValue = useWatch({ control, name: "email" });

  const onSubmit = async (values) => {
    setSubmitError("");
    setSuccessMessage("");
    try {
      const response = await authService.forgotPassword({
        email: values.email.trim(),
        captchaToken: values.captchaToken || "",
      });
      setSuccessMessage(response?.message || "If the account exists, a reset link has been sent.");
      setValue("captchaToken", "");
    } catch (error) {
      setSubmitError(error?.response?.data?.message || error?.message || "Unable to send reset instructions.");
      setValue("captchaToken", "");
    }
  };

  return (
    <AuthShell
      sectionLabel="Reset password"
      heading="Reset your password"
      description="Enter your email and we'll send reset instructions if an account exists."
      taskIcon={Mail}
      documentTitle="Reset password"
      brandTitle="Reset your password"
      brandSubtitle="We'll send reset instructions to your registered email address so you can regain access."
      brandIcon={Mail}
      footer={(
        <div className="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between">
          <p>Remembered your password?</p>
          <Link to="/login" className="font-semibold text-campus-700 no-underline hover:text-campus-800 dark:text-campus-300 dark:hover:text-campus-200">
            Back to sign in
          </Link>
        </div>
      )}
    >
      <AnimatePresence mode="wait">
        {successMessage ? (
          <Motion.div
            key="forgot-success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
              <Mail size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Check your email</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {emailValue ? `If an account exists for ${emailValue}, a reset link has been sent.` : successMessage}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Check your spam folder if the message does not arrive right away.</p>
            </div>
            <div className="rounded-[1.35rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
              {successMessage}
            </div>
          </Motion.div>
        ) : (
          <Motion.form
            key="forgot-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >
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

            <div>
              <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-200">Verification</p>
              <TurnstileWidget onVerify={(token) => setValue("captchaToken", token || "", { shouldValidate: true })} />
              {errors.captchaToken ? <p className="mt-2 text-sm font-medium text-rose-600 dark:text-rose-300">{errors.captchaToken.message}</p> : null}
            </div>

            <AnimatePresence mode="wait">
              {submitError ? (
                <Motion.div
                  key="forgot-error"
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
              <Mail size={16} />
              {isSubmitting ? "Sending..." : "Send instructions"}
              <ArrowRight size={16} />
            </button>
          </Motion.form>
        )}
      </AnimatePresence>
    </AuthShell>
  );
};
