import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Footer } from "../components/Landing/Footer";
import { Navbar } from "../components/Landing/Navbar";

export const LandingPage = () => {
  return (
    <div className="landing-canvas min-h-screen bg-white dark:bg-slate-900">
      <Navbar />
      <main className="relative flex min-h-[72vh] items-center justify-center px-4 pb-14 pt-32 sm:px-6 sm:pt-36">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,_rgba(14,165,233,0.14),_transparent_35%),radial-gradient(circle_at_88%_10%,_rgba(16,185,129,0.12),_transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.97),rgba(246,249,252,0.9))] dark:bg-[radial-gradient(circle_at_10%_20%,_rgba(14,165,233,0.2),_transparent_35%),radial-gradient(circle_at_88%_10%,_rgba(16,185,129,0.16),_transparent_32%),linear-gradient(180deg,rgba(2,8,23,0.94),rgba(15,23,42,0.92))]" />
        <section className="relative z-10 mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 dark:text-white sm:text-5xl lg:text-6xl">
            Campus Maintenance System
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-gray-700 dark:text-gray-300 sm:mt-6 sm:text-lg">
            Campus Maintenance System is built to help students, maintenance teams, and administrators report issues clearly, track every repair stage, and keep campus facilities running smoothly. It was created to remove delays and confusion in maintenance communication by keeping everything in one place. Click below to get started.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:mt-10">
            <Link
              to="/register"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-950 px-6 py-3.5 text-sm font-semibold text-white no-underline shadow-xl shadow-gray-950/15 transition hover:-translate-y-0.5 hover:bg-gray-900 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 sm:w-auto"
            >
              Get Started
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/about-us"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-300 bg-white/85 px-6 py-3.5 text-sm font-semibold text-gray-700 no-underline shadow-sm transition hover:border-campus-300 hover:text-campus-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-gray-200 dark:hover:border-campus-500 dark:hover:text-campus-300 sm:w-auto"
            >
              Learn More
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
