import clsx from "clsx";
import { STATUS_COLORS } from "../../utils/constants";
import { titleCase } from "../../utils/helpers";

export const StatusBadge = ({ status, className }) => (
  <span
    className={clsx(
      "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide",
      STATUS_COLORS[status] || "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-100",
      className
    )}
  >
    {titleCase(status)}
  </span>
);
