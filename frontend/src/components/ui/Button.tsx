import { type ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

const base =
  "inline-flex items-center justify-center font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-amber-700 text-white hover:bg-amber-800 focus:ring-amber-600 shadow",
  secondary:
    "bg-amber-50 text-amber-900 hover:bg-amber-100 focus:ring-amber-400 border border-amber-200",
  outline:
    "border border-amber-300 text-amber-900 hover:bg-amber-50 focus:ring-amber-400",
  ghost: "text-amber-800 hover:bg-amber-50 focus:ring-amber-400",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", loading, className, children, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          base,
          variants[variant],
          className,
          "px-5 py-2.5 text-base",
        )}
        disabled={loading || rest.disabled}
        {...rest}
      >
        {loading && (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
