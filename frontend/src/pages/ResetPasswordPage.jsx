import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, KeyRound } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { AuthPasswordField } from "../components/Auth/AuthPasswordField.jsx";
import { AuthShell } from "../components/Auth/AuthShell.jsx";
import { PasswordChecklist } from "../components/Auth/PasswordChecklist.jsx";
import { authService } from "../services/authService";
import { evaluatePassword } from "../utils/passwordPolicy";

const resetPasswordSchema = z
  .object({
    password: z.string().min(10, "Password must be at least 10 characters."),
  })
  .superRefine((values, context) => {
    const passwordState = evaluatePassword(values.password);
    if (!passwordState.valid) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: passwordState.messages[0] || "Password does not meet policy requirements.",
      });
    }
  });

export const ResetPasswordPage = () => {
  const token = new URLSearchParams(window.location.search).get("token");
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, touchedFields, submitCount },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
    },
  });

  const passwordValue = useWatch({ control, name: "password" });
  const passwordState = useMemo(() => evaluatePassword(passwordValue), [passwordValue]);

  const showChecklist = passwordValue.length > 0;
  const emphasizeChecklist = showChecklist && (Boolean(touchedFields.password) || submitCount > 0);

  const onSubmit = async (values) => {
    if (!token) return;
    setSubmitError("");
    setSuccessMessage("");
    try {
      const response = await authService.resetPassword(token, values.password);
      setSuccessMessage(response?.message || "Password updated successfully.");
    } catch (error) {
      setSubmitError(error?.response?.data?.message || error?.message || "Unable to reset the password.");
    }
  };

  if (!token) {
    return (
      <AuthShell
        sectionLabel="Reset password"
        heading="This reset link is no longer valid"
        description="Request a new reset link to continue."
        taskIcon={KeyRound}
        layout="single"
        documentTitle="Reset link invalid"
        footer={(
          <div className="text-sm text-slate-600 dark:text-slate-300">
            <Link to="/forgot-password" className="font-semibold text-campus-700 no-underline hover:text-campus-800 dark:text-campus-300 dark:hover:text-campus-200">
              Request a new reset link
            </Link>
          </div>
        )}
      >
        <div className="rounded-[1.35rem] border border-amber-200 bg-amber-50 px-4 py-4 text-sm font-medium text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
          The reset token is missing or expired.
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      sectionLabel="Choose a new password"
      heading="Choose a new password"
      description="Set a new password to regain access to your account."
      taskIcon={KeyRound}
      documentTitle="Choose a new password"
      brandTitle="Choose a new password"
      brandSubtitle="Set a strong password to keep your campus account secure. After reset, older sessions are revoked."
      brandIcon={KeyRound}
      footer={(
        <div className="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between">
          <p>Back to your account?</p>
          <Link to="/login" className="font-semibold text-campus-700 no-underline hover:text-campus-800 dark:text-campus-300 dark:hover:text-campus-200">
            Sign in
          </Link>
        </div>
      )}
    >
      <AnimatePresence mode="wait">
        {successMessage ? (
          <Motion.div
            key="reset-success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Password updated</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Your password has been changed. Sign in with your new credentials.
              </p>
            </div>
            <div className="rounded-[1.35rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
              {successMessage}
            </div>
            <Link
              to="/login"
              className="inline-flex w-full items-center justify-center gap-2 rounded-[1.35rem] bg-[linear-gradient(135deg,#102033,#1d63ed)] px-4 py-3.5 text-sm font-semibold text-white no-underline shadow-[0_20px_40px_-24px_rgba(16,32,51,0.55)] transition hover:-translate-y-0.5"
            >
              <KeyRound size={16} />
              Sign in
            </Link>
          </Motion.div>
        ) : (
          <Motion.form
            key="reset-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >
            <AuthPasswordField
              label="New password"
              error={errors.password?.message}
              registration={register("password")}
              autoComplete="new-password"
              placeholder="Enter a new password"
            />

            <PasswordChecklist
              passwordState={passwordState}
              show={showChecklist}
              emphasizeInvalid={emphasizeChecklist}
            />

            <AnimatePresence mode="wait">
              {submitError ? (
                <Motion.div
                  key="reset-error"
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
              <CheckCircle2 size={16} />
              {isSubmitting ? "Updating..." : "Update password"}
            </button>
          </Motion.form>
        )}
      </AnimatePresence>
    </AuthShell>
  );
};
