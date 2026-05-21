import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  ...props
}) => {
  const alignClass = align === "center" ? "text-center items-center" : "text-left items-start";
  return (
    <div
      className={cn("flex flex-col gap-2", alignClass, className)}
      {...props}
    >
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-campus-700 dark:text-campus-300">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {description}
        </p>
      ) : null}
    </div>
  );
};

