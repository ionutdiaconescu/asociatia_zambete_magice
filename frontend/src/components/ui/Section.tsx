import { type HTMLAttributes } from "react";
import clsx from "clsx";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  contained?: boolean;
  title?: string;
  description?: string;
  spacing?: "sm" | "md" | "lg";
}

const spacingMap = {
  sm: "py-8",
  md: "py-14",
  lg: "py-20",
};

export function Section({
  className,
  contained = true,
  title,
  description,
  spacing = "md",
  children,
  ...rest
}: SectionProps) {
  return (
    <section className={clsx(spacingMap[spacing], className)} {...rest}>
      <div
        className={clsx(contained && "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8")}
      >
        {(title || description) && (
          <div className="mb-10">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-3">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-slate-600 max-w-3xl text-[1.02rem] leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
