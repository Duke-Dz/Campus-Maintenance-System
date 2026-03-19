import { ArrowLeft, ArrowRight, ClipboardList, Route, Users } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { BottomSocialSection, Footer, QuickLinksSection } from "../components/Landing/Footer";
import { Navbar } from "../components/Landing/Navbar";

const PRODUCT_POINTS = [
  "CampusFix was built by students after seeing too many maintenance issues stay unresolved for too long.",
  "Students can report a problem quickly with the exact location, a clear description, and urgency.",
  "Maintenance crews can see assigned work in one queue and keep updates visible as work moves forward.",
  "Admins can step in when a ticket needs approval, reassignment, or special handling.",
];

const WORKFLOW_CARDS = [
  {
    title: "Ticket Lifecycle",
    text: "A ticket moves from submitted to assigned, accepted, in progress, resolved, and closed so everyone can follow each step.",
  },
  {
    title: "Student View",
    text: "Students can check status at any time and see if the request is waiting, being worked on, or completed.",
  },
  {
    title: "Maintenance Flow",
    text: "Crew members accept or decline assignments, add notes while working, and upload completion evidence when needed.",
  },
  {
    title: "Admin Validation",
    text: "If assignments fail, conflicts happen, or a request stays unassigned too long, admins validate and reroute work.",
  },
];

const FAQS = [
  {
    question: "Who can submit a ticket?",
    answer: "Any registered student can submit a maintenance ticket from their dashboard.",
  },
  {
    question: "What should I include in a good ticket?",
    answer: "Include the exact building and location, what is wrong, and how urgent it is. A photo helps when the issue is hard to describe.",
  },
  {
    question: "How will I know when work starts?",
    answer: "Ticket status updates appear in your dashboard, including assignment and progress changes.",
  },
  {
    question: "What if the assigned crew cannot take the ticket?",
    answer: "The ticket goes back for admin validation so it can be reassigned quickly.",
  },
  {
    question: "Can admins override workflow decisions?",
    answer: "Yes. Admins can validate edge cases, handle conflicts, and move tickets when special action is required.",
  },
  {
    question: "Why was this system created on campus?",
    answer: "It was created by students to reduce delays, improve visibility, and make sure reported issues are actually followed through.",
  },
];

export const AboutPage = () => {
  useEffect(() => {
    document.title = "Learn More | CampusFix";
  }, []);

  return (
    <div className="landing-canvas min-h-screen bg-white dark:bg-slate-900">
      <Navbar
        links={[
          { label: "Product", href: "#product" },
          { label: "Workflow", href: "#workflow" },
          { label: "FAQs", href: "#faq" },
        ]}
      />

      <main className="mx-auto w-full max-w-[1100px] px-5 pb-16 pt-28 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/90 px-3 py-2 text-sm font-semibold text-gray-700 no-underline shadow-sm transition hover:border-campus-300 hover:text-campus-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-gray-200 dark:hover:border-campus-500 dark:hover:text-campus-300"
        >
          <ArrowLeft size={15} />
          Back to Landing
        </Link>

        <section id="product" className="mt-6 min-h-[52vh] rounded-3xl border border-gray-200 bg-white p-7 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-campus-50 px-3 py-1 text-xs font-semibold text-campus-700 dark:bg-campus-900/30 dark:text-campus-300">
            <ClipboardList size={14} />
            Product
          </div>
          <h1 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Built by students to solve real campus delays</h1>
          <p className="mt-4 max-w-4xl text-base leading-relaxed text-gray-700 dark:text-gray-300 sm:text-lg">
            CampusFix exists because many campus issues were reported but not tracked clearly from start to finish. This system gives students, maintenance teams, and admins one shared workflow so problems are seen, assigned, and resolved without guesswork.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-gray-700 dark:text-gray-300 sm:text-base">
            {PRODUCT_POINTS.map((point) => (
              <li key={point} className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-campus-500" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>

        <section id="workflow" className="mt-8 min-h-[52vh] rounded-3xl border border-gray-200 bg-white p-7 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-campus-50 px-3 py-1 text-xs font-semibold text-campus-700 dark:bg-campus-900/30 dark:text-campus-300">
            <Route size={14} />
            Workflow
          </div>
          <h2 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">How tickets move through the system</h2>
          <p className="mt-3 max-w-4xl text-base leading-relaxed text-gray-700 dark:text-gray-300">
            The workflow is structured so each person knows what to do next. Students report, maintenance accepts and resolves, and admins validate exceptions.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {WORKFLOW_CARDS.map((card) => (
              <article key={card.title} className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-slate-700 dark:bg-slate-950/70">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">{card.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="faq" className="mt-8 rounded-3xl border border-gray-200 bg-white p-7 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-campus-50 px-3 py-1 text-xs font-semibold text-campus-700 dark:bg-campus-900/30 dark:text-campus-300">
            <Users size={14} />
            FAQ
          </div>
          <h2 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Frequently asked questions</h2>
          <div className="mt-6 space-y-3">
            {FAQS.map((item) => (
              <details key={item.question} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-950/70">
                <summary className="cursor-pointer list-none text-base font-semibold text-gray-900 dark:text-white">{item.question}</summary>
                <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-8 flex justify-center">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-2xl bg-gray-950 px-6 py-3.5 text-sm font-semibold text-white no-underline shadow-xl shadow-gray-950/15 transition hover:-translate-y-0.5 hover:bg-gray-900 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
          >
            Get Started
            <ArrowRight size={16} />
          </Link>
        </div>
      </main>

      <QuickLinksSection config={{ supportPhone: "+254 747988030" }} useAboutLinks />
      <BottomSocialSection />
      <Footer />
    </div>
  );
};

export default AboutPage;
