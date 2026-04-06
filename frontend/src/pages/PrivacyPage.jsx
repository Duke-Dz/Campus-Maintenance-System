import { ArrowLeft, FileText } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Footer } from "../components/Landing/Footer";
import { Navbar } from "../components/Landing/Navbar";

const PRIVACY_POINTS = [
  "We store account and ticket details only for maintenance operations.",
  "Your reports and attachments are used to diagnose and resolve issues.",
  "Only authorized users can access maintenance records based on role.",
  "We do not sell student or staff personal data.",
  "Data is retained only as long as required for service and compliance.",
  "You can request corrections for inaccurate profile information.",
];

export const PrivacyPage = () => {
  useEffect(() => {
    document.title = "Privacy Policy | CampusFix";
  }, []);

  return (
    <div className="landing-canvas min-h-screen bg-white dark:bg-slate-900">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 pb-14 pt-24 sm:px-6 sm:pb-16 sm:pt-28">
        <Link
          to="/about-us"
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/90 px-3 py-2 text-sm font-semibold text-gray-700 no-underline shadow-sm transition hover:border-campus-300 hover:text-campus-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-gray-200 dark:hover:border-campus-500 dark:hover:text-campus-300"
        >
          <ArrowLeft size={15} />
          Back to Learn More
        </Link>

        <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-campus-50 px-3 py-1 text-xs font-semibold text-campus-700 dark:bg-campus-900/30 dark:text-campus-300">
            <FileText size={14} />
            Privacy Policy
          </div>
          <h1 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">How your data is handled</h1>
          <ul className="mt-5 space-y-3 text-sm text-gray-700 dark:text-gray-300 sm:text-base">
            {PRIVACY_POINTS.map((point) => (
              <li key={point} className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-campus-500" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPage;
