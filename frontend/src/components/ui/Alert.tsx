import { Button } from "./Button";

interface AlertProps {
  title?: string;
  children?: React.ReactNode;
  variant?: "error" | "info" | "success" | "warning";
  onRetry?: () => void;
}

const variantStyles: Record<string, string> = {
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
  success: "border-green-200 bg-green-50 text-green-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
};

export function Alert({
  title,
  children,
  variant = "info",
  onRetry,
}: AlertProps) {
  return (
    <div
      className={`rounded-md border p-4 text-sm ${variantStyles[variant]}`}
      role={variant === "error" ? "alert" : undefined}
    >
      {title && <p className="font-medium mb-1">{title}</p>}
      {children && <div className="leading-relaxed">{children}</div>}
      {onRetry && (
        <div className="mt-3">
          <Button
            variant="outline"
            onClick={onRetry}
            className="px-3 py-1 text-xs"
          >
            Reîncearcă
          </Button>
        </div>
      )}
    </div>
  );
}
