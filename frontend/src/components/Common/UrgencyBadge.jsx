import clsx from "clsx";
import { URGENCY_COLORS } from "../../utils/constants";
import { titleCase } from "../../utils/helpers";

export const UrgencyBadge = ({ urgency, className }) => (
  <span
    className={clsx(
      "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide",
      URGENCY_COLORS[urgency] || "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-100",
      className
    )}
  >
    {titleCase(urgency)}
  </span>
);
