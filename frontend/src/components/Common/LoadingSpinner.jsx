export const LoadingSpinner = ({ label = "Loading..." }) => (
  <div className="flex items-center justify-center gap-3 py-8 text-slate-600 dark:text-slate-300">
    <span className="h-5 w-5 animate-spin rounded-full border-2 border-campus-200 border-t-campus-500 dark:border-campus-900 dark:border-t-campus-400" />
    <span className="text-sm font-medium">{label}</span>
  </div>
);
