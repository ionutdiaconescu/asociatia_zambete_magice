import { type HTMLAttributes } from "react";
import clsx from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
  hover?: boolean;
}

export function Card({
  className,
  padded = true,
  hover = true,
  ...rest
}: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-slate-200/90 bg-white shadow-[0_6px_20px_rgba(15,23,42,0.05)]",
        hover &&
          "transition duration-300 hover:shadow-[0_10px_28px_rgba(15,23,42,0.10)]",
        padded && "p-5 sm:p-6",
        className,
      )}
      {...rest}
    />
  );
}

export function CardHeader({
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("mb-3 flex items-start justify-between gap-4", className)}
      {...rest}
    />
  );
}

export function CardTitle({
  className,
  ...rest
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={clsx("text-lg font-semibold text-slate-900", className)}
      {...rest}
    />
  );
}

export function CardContent({
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("text-base text-slate-600 space-y-3", className)}
      {...rest}
    />
  );
}
