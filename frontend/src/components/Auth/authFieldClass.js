export const authFieldClass = (hasError) =>
  [
    "mt-2 w-full rounded-[1.35rem] border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400",
    "dark:bg-slate-950 dark:text-white",
    hasError
      ? "border-rose-300 ring-4 ring-rose-100/80 dark:border-rose-500/60 dark:ring-rose-500/10"
      : "border-slate-200 hover:border-campus-300 focus:border-campus-500 focus:ring-4 focus:ring-campus-100/80 dark:border-slate-700 dark:hover:border-campus-500/70 dark:focus:ring-campus-500/10",
  ].join(" ");

