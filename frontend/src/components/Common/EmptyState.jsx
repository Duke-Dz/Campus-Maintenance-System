export const EmptyState = ({ title, message }) => (
  <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-8 text-center dark:border-slate-700 dark:bg-slate-900/70">
    <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-mint/15" />
    <h3 className="text-lg font-semibold text-ink dark:text-slate-100">{title}</h3>
    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{message}</p>
  </div>
);
