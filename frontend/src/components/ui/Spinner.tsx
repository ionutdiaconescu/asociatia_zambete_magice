interface SpinnerProps {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-4",
};

export function Spinner({
  label = "Se încarcă",
  size = "md",
  className = "",
}: SpinnerProps) {
  return (
    <div className="flex items-center gap-3" role="status" aria-live="polite">
      <span
        className={`inline-block animate-spin rounded-full border-current border-t-transparent text-blue-600 ${sizeMap[size]} ${className}`}
      />
      {label && <span className="text-sm text-gray-600">{label}...</span>}
    </div>
  );
}
