import { type ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

const base =
  "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm",
  secondary: "bg-blue-50 text-blue-700 hover:bg-blue-100 focus:ring-blue-400",
  outline:
    "border border-blue-300 text-blue-700 hover:bg-blue-50 focus:ring-blue-400",
  ghost: "text-blue-600 hover:bg-blue-50 focus:ring-blue-400",
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
          "px-4 py-2 text-sm"
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
  }
);

Button.displayName = "Button";
