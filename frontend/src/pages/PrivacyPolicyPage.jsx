import { useEffect } from "react";
import { Footer } from "../components/Landing/Footer";
import { Navbar } from "../components/Landing/Navbar";

const sections = [
  {
    title: "1. What we collect",
    points: [
      "Basic account details such as your name, email, and username.",
      "Ticket content including descriptions, locations, photos, and status updates.",
      "Technical data such as log entries that help keep the service reliable and secure.",
    ],
  },
  {
    title: "2. How your data is used",
    points: [
      "To sign you in and keep your sessions secure.",
      "To route, investigate, and resolve maintenance and support issues on campus.",
      "To monitor system health and plan improvements to operations.",
    ],
  },
  {
    title: "3. Access and sharing",
    points: [
      "Only authorized staff at your institution can access sensitive ticket data.",
      "Data is not sold. Limited third-party providers may process data to host and deliver the service.",
    ],
  },
  {
    title: "4. Retention and security",
    points: [
      "Tickets and account records are kept only as long as needed for operations and compliance.",
      "Industry-standard protections, including encryption in transit and access controls, are used to reduce risk.",
    ],
  },
  {
    title: "5. Your choices",
    points: [
      "You can request access to, or correction of, your personal information through your institution.",
      "Avoid including unnecessary sensitive personal details in ticket descriptions or attachments.",
    ],
  },
  {
    title: "6. Contact",
    points: [
      "For questions about privacy, contact your institution’s CampusFix administrator or use the Contact Support page.",
    ],
  },
];

export const PrivacyPolicyPage = () => {
  useEffect(() => {
    document.title = "Privacy Policy | CampusFix";
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navbar />
      <main className="public-page-enter mx-auto max-w-4xl px-5 pb-16 pt-28 sm:px-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-campus-700 dark:text-campus-300">
            Privacy overview
          </p>
          <h1 className="mt-3 text-3xl font-extrabold text-slate-950 dark:text-white sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Effective date: {new Date().getFullYear()}
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            This page explains, in straightforward terms, how information in CampusFix is collected,
            used, and protected as part of your institution’s operations.
          </p>
        </header>

        <section className="mt-8 space-y-6 text-sm text-slate-700 dark:text-slate-300">
          {sections.map((section) => (
            <article key={section.title} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/80">
              <h2 className="text-base font-semibold text-slate-950 dark:text-white">
                {section.title}
              </h2>
              <ul className="mt-2 space-y-1.5">
                {section.points.map((point) => (
                  <li key={point} className="flex gap-2">
                    <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-campus-500" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;

