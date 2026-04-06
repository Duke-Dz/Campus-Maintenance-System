import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle2, KeyRound } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { AuthPasswordField } from "../components/Auth/AuthPasswordField.jsx";
import { AuthShell } from "../components/Auth/AuthShell.jsx";
import { PasswordChecklist } from "../components/Auth/PasswordChecklist.jsx";
import { authService } from "../services/authService";
import { evaluatePassword } from "../utils/passwordPolicy";

const inviteSchema = z
  .object({
    username: z.string().trim().min(3, "Username must be at least 3 characters.").max(50, "Username must be 50 characters or fewer."),
    password: z.string().min(10, "Password must be at least 10 characters."),
  })
  .superRefine((values, context) => {
    const passwordState = evaluatePassword(values.password, { username: values.username });
    if (!passwordState.valid) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: passwordState.messages[0] || "Password does not meet policy requirements.",
      });
    }
  });

export const AcceptInvitePage = () => {
  const token = new URLSearchParams(window.location.search).get("token");
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [usernameSuggestions, setUsernameSuggestions] = useState([]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors, isSubmitting, touchedFields, submitCount },
  } = useForm({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const usernameValue = useWatch({ control, name: "username" });
  const passwordValue = useWatch({ control, name: "password" });
  const passwordState = useMemo(
    () => evaluatePassword(passwordValue, { username: usernameValue }),
    [passwordValue, usernameValue]
  );
  const showChecklist = passwordValue.length > 0;
  const emphasizeChecklist = showChecklist && (Boolean(touchedFields.password) || submitCount > 0);

  const fetchSuggestions = async () => {
    const { username } = getValues();
    if (!username?.trim() || username.trim().length < 3) {
      setUsernameSuggestions([]);
      return;
    }
    try {
      const suggestions = await authService.getUsernameSuggestions(username.trim());
      setUsernameSuggestions(suggestions);
    } catch {
      setUsernameSuggestions([]);
    }
  };

  const onSubmit = async (values) => {
    if (!token) return;
    setSubmitError("");
    try {
      const response = await authService.acceptStaffInvite(token, values.username.trim(), values.password);
      setSuccessMessage(response?.message || "Account activated successfully.");
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || "Unable to accept the invitation.";
      setSubmitError(message);
      if (message.toLowerCase().includes("username")) {
        await fetchSuggestions();
      }
    }
  };

  if (!token) {
    return (
      <AuthShell
        sectionLabel="Staff invite"
        heading="This invitation link is no longer valid"
        description="Ask an administrator to issue a new staff invitation."
        taskIcon={KeyRound}
        layout="single"
        documentTitle="Invitation invalid"
        footer={(
          <div className="text-sm text-slate-600 dark:text-slate-300">
            <Link to="/login" className="font-semibold text-campus-700 no-underline hover:text-campus-800 dark:text-campus-300 dark:hover:text-campus-200">
              Back to sign in
            </Link>
          </div>
        )}
      >
        <div className="rounded-[1.35rem] border border-amber-200 bg-amber-50 px-4 py-4 text-sm font-medium text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
          The invitation token is missing or expired.
        </div>
      </AuthShell>
    );
  }

  const inviteAside = (
      <div className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Invite-only access</p>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Maintenance and admin accounts are created by invitation, not by public registration.
          </p>
        </div>
        <div className="rounded-[1.35rem] border border-slate-200/80 bg-white/78 px-4 py-3 text-sm leading-6 text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
          Choose an available username and strong password, then sign in with those credentials.
        </div>
      </div>
  );

  return (
    <AuthShell
      sectionLabel="Staff invite"
      heading="Create your staff credentials"
      description="Finish activating your staff account with a username and password."
      aside={inviteAside}
      taskIcon={KeyRound}
      documentTitle="Create your staff credentials"
      footer={(
        <div className="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between">
          <p>Already accepted the invite?</p>
          <Link to="/login" className="font-semibold text-campus-700 no-underline hover:text-campus-800 dark:text-campus-300 dark:hover:text-campus-200">
            Sign in
          </Link>
        </div>
      )}
    >
      {successMessage ? (
        <div className="space-y-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Account activated</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Your staff account is ready. Sign in to access the maintenance dashboard.
            </p>
          </div>
          <div className="rounded-[1.35rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
            {successMessage}
          </div>
          <Link
            to="/login"
            className="inline-flex w-full items-center justify-center gap-2 rounded-[1.35rem] bg-[linear-gradient(135deg,#102033,#1d63ed)] px-4 py-3.5 text-sm font-semibold text-white no-underline shadow-[0_20px_40px_-24px_rgba(16,32,51,0.55)] transition hover:-translate-y-0.5"
          >
            <ArrowRight size={16} />
            Sign in
          </Link>
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
              onBlur={fetchSuggestions}
              placeholder="Choose your username"
              className="mt-2 w-full rounded-[1.35rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-campus-300 focus:border-campus-500 focus:ring-4 focus:ring-campus-100/80 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:border-campus-500/70 dark:focus:ring-campus-500/10"
            />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">You will use this username to sign in.</p>
            {errors.username?.message ? (
              <p className="mt-2 text-sm font-medium text-rose-600 dark:text-rose-300">{errors.username.message}</p>
            ) : null}
          </label>

          {usernameSuggestions.length > 0 ? (
            <div className="rounded-[1.35rem] border border-campus-100 bg-campus-50 px-4 py-3 dark:border-campus-500/20 dark:bg-campus-500/10">
              <p className="text-sm font-semibold text-campus-800 dark:text-campus-100">Available usernames</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {usernameSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setValue("username", suggestion, { shouldValidate: true, shouldDirty: true })}
                    className="rounded-full border border-campus-200 bg-white px-3 py-1.5 text-xs font-semibold text-campus-700 transition hover:border-campus-400 hover:text-campus-800 dark:border-campus-500/40 dark:bg-slate-950 dark:text-campus-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <AuthPasswordField
            label="Password"
            error={errors.password?.message}
            registration={register("password")}
            autoComplete="new-password"
            placeholder="Create a password"
          />

          <PasswordChecklist
            passwordState={passwordState}
            show={showChecklist}
            emphasizeInvalid={emphasizeChecklist}
          />

          {submitError ? <div className="rounded-[1.35rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">{submitError}</div> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-[1.35rem] bg-[linear-gradient(135deg,#102033,#1d63ed)] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_20px_40px_-24px_rgba(16,32,51,0.55)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <KeyRound size={16} />
            {isSubmitting ? "Activating..." : "Activate account"}
          </button>
        </form>
      )}
    </AuthShell>
  );
};
