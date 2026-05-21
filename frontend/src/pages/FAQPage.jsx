import { useEffect } from "react";
import { Footer } from "../components/Landing/Footer";
import { Navbar } from "../components/Landing/Navbar";

const faqs = [
  {
    q: "What is CampusFix?",
    a: "CampusFix is a maintenance ticketing system for campuses. Students report issues, maintenance teams work a single queue, and administrators track backlog and SLA health.",
  },
  {
    q: "Who is CampusFix for?",
    a: "It is built for students, facilities and maintenance teams, housing and student affairs, and campus operations leadership.",
  },
  {
    q: "Do students see all tickets?",
    a: "No. Students only see the status and history of their own requests. Admins and staff have role-based access to the wider queue.",
  },
  {
    q: "How do I submit a request?",
    a: "Students sign in, choose the building and room, describe the issue, set urgency, and can attach a photo before sending.",
  },
  {
    q: "How often is ticket status updated?",
    a: "Status changes whenever staff triage, assign, start, or complete work, so you can check progress without chasing emails.",
  },
  {
    q: "How do I get help with my account?",
    a: "Use the Contact Support page to send details about your issue. Include your role, building, and any error messages you have seen.",
  },
];

export const FAQPage = () => {
  useEffect(() => {
    document.title = "FAQ | CampusFix";
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navbar />
      <main className="public-page-enter mx-auto max-w-4xl px-5 pb-16 pt-28 sm:px-6">
        <header className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-campus-700 dark:text-campus-300">
            Help and overview
          </p>
          <h1 className="mt-3 text-3xl font-extrabold text-slate-950 dark:text-white sm:text-4xl">
            Frequently asked questions
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Quick answers to common questions about how CampusFix works for students, maintenance
            teams, and administrators.
          </p>
        </header>

        <section className="mt-10 space-y-3">
          {faqs.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm open:border-campus-300 open:bg-campus-50/40 dark:border-slate-700 dark:bg-slate-900 dark:open:border-campus-700 dark:open:bg-campus-900/20"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-slate-900 dark:text-white">
                {item.q}
                <span className="text-xs text-slate-400 transition-transform group-open:rotate-180 dark:text-slate-500">
                  ▼
                </span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {item.a}
              </p>
            </details>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FAQPage;

