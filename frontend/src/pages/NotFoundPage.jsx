import { Link } from "react-router-dom";

export const NotFoundPage = () => (
  <div className="flex min-h-screen items-center justify-center px-4">
    <div className="text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-mint">404</p>
      <h1 className="mt-2 text-3xl font-bold text-ink dark:text-slate-100">Page Not Found</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">The page you requested does not exist.</p>
      <Link to="/" className="mt-5 inline-block rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white dark:bg-mint dark:text-slate-950">
        Go Home
      </Link>
    </div>
  </div>
);
