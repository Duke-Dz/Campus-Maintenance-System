import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { AuthPasswordField } from "../components/Auth/AuthPasswordField.jsx";
import { AuthShell } from "../components/Auth/AuthShell.jsx";
import { PasswordChecklist } from "../components/Auth/PasswordChecklist.jsx";
import { TurnstileWidget } from "../components/Auth/TurnstileWidget.jsx";
import { turnstileEnabled } from "../components/Auth/turnstileConfig.js";
import { useAuth } from "../hooks/useAuth";
import { authService } from "../services/authService";
import { evaluatePassword } from "../utils/passwordPolicy";

const registerSchema = z
  .object({
    username: z.string().trim().min(3, "Username must be at least 3 characters."),
    email: z.string().trim().email("Enter a valid email address."),
    fullName: z.string().trim().min(2, "Enter your full name."),
    password: z.string().min(10, "Password must be at least 10 characters."),
    captchaToken: turnstileEnabled ? z.string().min(1, "Complete the verification challenge.") : z.string().optional(),
  })
  .superRefine((values, context) => {
    const passwordState = evaluatePassword(values.password, values);
    if (!passwordState.valid) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: passwordState.messages[0] || "Password does not meet policy requirements.",
      });
    }
  });

const fieldClass = (hasError) =>
  `mt-2 w-full rounded-[1.35rem] border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 dark:bg-slate-950 dark:text-white ${
    hasError
      ? "border-rose-300 ring-4 ring-rose-100/80 dark:border-rose-500/60 dark:ring-rose-500/10"
      : "border-slate-200 hover:border-campus-300 focus:border-campus-500 focus:ring-4 focus:ring-campus-100/80 dark:border-slate-700 dark:hover:border-campus-500/70 dark:focus:ring-campus-500/10"
  }`;

const normalizeRegisterSubmitError = (message) => {
  const value = (message || "").trim();
  if (!value) {
    return "Unable to create your account.";
  }
  if (value.toLowerCase() === "internal server error") {
    return "We couldn't start email verification right now. Please try again in a moment. If the problem continues, contact support.";
  }
  return value;
};

export const RegisterPage = () => {
  const { register: registerAccount } = useAuth();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState("");
  const [usernameSuggestions, setUsernameSuggestions] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    formState: { errors, isSubmitting, touchedFields, submitCount },
  } = useForm({
    resolver: zodResolver(registerSchema),
      defaultValues: {
      username: "",
      email: "",
      fullName: "",
      password: "",
      captchaToken: "",
    },
  });

  const passwordValue = useWatch({ control, name: "password" });
  const usernameValue = useWatch({ control, name: "username" });
  const emailValue = useWatch({ control, name: "email" });
  const fullNameValue = useWatch({ control, name: "fullName" });

  const passwordState = useMemo(
    () => evaluatePassword(passwordValue, { username: usernameValue, email: emailValue, fullName: fullNameValue }),
    [emailValue, fullNameValue, passwordValue, usernameValue]
  );

  const showChecklist = passwordValue.length > 0;
  const emphasizeChecklist = showChecklist && (Boolean(touchedFields.password) || submitCount > 0);

  const fetchSuggestions = async () => {
    const { username, fullName } = getValues();
    if (!username?.trim() || username.trim().length < 3) {
      setUsernameSuggestions([]);
      return;
    }
    try {
      const suggestions = await authService.getUsernameSuggestions(username.trim(), fullName?.trim() || "");
      setUsernameSuggestions(suggestions);
    } catch {
      setUsernameSuggestions([]);
    }
  };

  const onSubmit = async (values) => {
    setSubmitError("");
    try {
      await registerAccount({
        username: values.username.trim(),
        email: values.email.trim(),
        fullName: values.fullName.trim(),
        password: values.password,
        captchaToken: values.captchaToken || "",
      });
      navigate(`/verify-email?email=${encodeURIComponent(values.email.trim().toLowerCase())}`, { replace: true });
    } catch (error) {
      setSubmitError(normalizeRegisterSubmitError(error.message));
      if ((error.message || "").toLowerCase().includes("username")) {
        await fetchSuggestions();
      }
      setValue("captchaToken", "");
    }
  };

  return (
    <AuthShell
      heading="Create your account"
      description="Start with your sign-in details. We will send a secure verification code before your first login."
      layout="single"
      documentTitle="Create account"
      footer={(
        <div className="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between">
          <p>Already have an account?</p>
          <Link to="/login" className="font-semibold text-campus-700 no-underline hover:text-campus-800 dark:text-campus-300 dark:hover:text-campus-200">
            Sign in
          </Link>
        </div>
      )}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Username</span>
            <input
              {...register("username")}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="Choose a username"
              onBlur={fetchSuggestions}
              className={fieldClass(Boolean(errors.username))}
            />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">You will use this username to sign in.</p>
            {errors.username ? <p className="mt-2 text-sm font-medium text-rose-600 dark:text-rose-300">{errors.username.message}</p> : null}
          </label>

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
        </div>

        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Full name</span>
          <input
            {...register("fullName")}
            autoComplete="name"
            placeholder="Enter your full name"
            className={fieldClass(Boolean(errors.fullName))}
          />
          {errors.fullName ? <p className="mt-2 text-sm font-medium text-rose-600 dark:text-rose-300">{errors.fullName.message}</p> : null}
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

        {turnstileEnabled ? (
          <div>
            <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-200">Verification</p>
            <TurnstileWidget onVerify={(token) => setValue("captchaToken", token || "", { shouldValidate: true })} />
            {errors.captchaToken ? <p className="mt-2 text-sm font-medium text-rose-600 dark:text-rose-300">{errors.captchaToken.message}</p> : null}
          </div>
        ) : null}

        {submitError ? (
          <div className="rounded-[1.35rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            {submitError}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-[1.35rem] bg-[linear-gradient(135deg,#102033,#1d63ed)] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_20px_40px_-24px_rgba(16,32,51,0.55)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <UserPlus size={16} />
          {isSubmitting ? "Creating account..." : "Create account"}
          <ArrowRight size={16} />
        </button>
      </form>
    </AuthShell>
  );
};
