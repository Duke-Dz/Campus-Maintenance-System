import { ArrowLeft, Shield } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { BottomSocialSection, Footer, QuickLinksSection } from "../components/Landing/Footer";
import { Navbar } from "../components/Landing/Navbar";

const TERMS_POINTS = [
  "Use your account responsibly and keep your login details private.",
  "Only submit real campus maintenance issues with accurate details.",
  "Do not use this system for spam, abuse, fake reports, or disruption.",
  "Campus maintenance teams can update workflows as operations improve.",
  "Severe misuse can lead to account restrictions or removal.",
  "By using the platform, you agree to policy updates posted on this page.",
];

export const TermsPage = () => {
  useEffect(() => {
    document.title = "Terms and Conditions | CampusFix";
  }, []);

  return (
    <div className="landing-canvas min-h-screen bg-white dark:bg-slate-900">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-5 pb-16 pt-28 sm:px-6">
        <Link
          to="/about-us"
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/90 px-3 py-2 text-sm font-semibold text-gray-700 no-underline shadow-sm transition hover:border-campus-300 hover:text-campus-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-gray-200 dark:hover:border-campus-500 dark:hover:text-campus-300"
        >
          <ArrowLeft size={15} />
          Back to Learn More
        </Link>

        <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-campus-50 px-3 py-1 text-xs font-semibold text-campus-700 dark:bg-campus-900/30 dark:text-campus-300">
            <Shield size={14} />
            Terms and Conditions
          </div>
          <h1 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">How to use CampusFix responsibly</h1>
          <ul className="mt-5 space-y-3 text-sm text-gray-700 dark:text-gray-300 sm:text-base">
            {TERMS_POINTS.map((point) => (
              <li key={point} className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-campus-500" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <QuickLinksSection config={{ supportPhone: "+254 747988030" }} useAboutLinks />
      <BottomSocialSection />
      <Footer />
    </div>
  );
};

export default TermsPage;
