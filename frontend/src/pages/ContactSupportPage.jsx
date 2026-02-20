import { ArrowLeft, LifeBuoy, Mail, MessageSquareText, Send } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { supportService } from "../services/supportService";

const SUPPORT_CATEGORIES = [
  "Account Access",
  "Ticket Submission",
  "Status Updates",
  "Notifications",
  "Billing / Subscription",
  "Technical Bug",
  "Feature Request",
  "Other",
];

const INITIAL_FORM = {
  fullName: "",
  email: "",
  category: SUPPORT_CATEGORIES[0],
  subject: "",
  message: "",
};

export const ContactSupportPage = () => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.fullName.trim()) {
      setError("Full name is required.");
      return;
    }
    if (!form.email.trim() || !form.email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    if (!form.subject.trim()) {
      setError("Subject is required.");
      return;
    }
    if (!form.message.trim() || form.message.trim().length < 20) {
      setError("Message should be at least 20 characters.");
      return;
    }

    setSending(true);
    try {
      const response = await supportService.submit({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        category: form.category,
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      setSuccess(response?.message || "Support request submitted. Our team will reply by email.");
      setForm(INITIAL_FORM);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit support request. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const inputClass =
    "mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-campus-500 focus:ring-4 focus:ring-campus-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-campus-400 dark:focus:ring-campus-900/30";

  return (
    <div className="min-h-screen bg-gradient-to-br from-campus-50 via-white to-blue-100 px-4 py-8 dark:from-slate-950 dark:via-slate-900 dark:to-campus-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 no-underline transition hover:border-campus-300 hover:text-campus-600 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200 dark:hover:border-campus-600 dark:hover:text-campus-300"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <aside className="rounded-3xl border border-campus-100 bg-white/90 p-6 shadow-xl shadow-campus-500/10 dark:border-slate-700 dark:bg-slate-900/80">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-campus-100 text-campus-600 dark:bg-campus-900/40 dark:text-campus-300">
              <LifeBuoy size={22} />
            </div>
            <h1 className="mt-4 text-2xl font-extrabold text-gray-900 dark:text-white">Contact Support</h1>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              Need help with CampusFix? Submit your support request and include as much detail as possible so we can resolve it faster.
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60">
                <Mail size={16} className="mt-0.5 text-campus-600 dark:text-campus-300" />
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">campusfixsystems@gmail.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60">
                <MessageSquareText size={16} className="mt-0.5 text-campus-600 dark:text-campus-300" />
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Response Window</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Available from 8:00 AM to 5:00 PM</p>
                </div>
              </div>
            </div>
          </aside>

          <form
            onSubmit={submit}
            className="rounded-3xl border border-campus-100 bg-white/95 p-6 shadow-xl shadow-campus-500/10 dark:border-slate-700 dark:bg-slate-900/90 sm:p-8"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                Full Name
                <input
                  type="text"
                  value={form.fullName}
                  onChange={onChange("fullName")}
                  className={inputClass}
                  placeholder="Enter your full name"
                />
              </label>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={onChange("email")}
                  className={inputClass}
                  placeholder="you@school.edu"
                />
              </label>
            </div>

            <label className="mt-4 block text-sm font-semibold text-gray-700 dark:text-gray-200">
              Category
              <select value={form.category} onChange={onChange("category")} className={inputClass}>
                {SUPPORT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-4 block text-sm font-semibold text-gray-700 dark:text-gray-200">
              Subject
              <input
                type="text"
                value={form.subject}
                onChange={onChange("subject")}
                className={inputClass}
                placeholder="Brief summary of your issue"
              />
            </label>

            <label className="mt-4 block text-sm font-semibold text-gray-700 dark:text-gray-200">
              Message
              <textarea
                value={form.message}
                onChange={onChange("message")}
                className={`${inputClass} min-h-36 resize-y`}
                placeholder="Please share details about your request so we can assist you better."
              />
            </label>

            {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">{error}</p>}
            {success && (
              <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={sending}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-campus-500 to-campus-600 px-4 py-3 text-sm font-semibold text-white transition hover:from-campus-600 hover:to-campus-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {sending ? "Submitting..." : "Submit Support Request"}
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
