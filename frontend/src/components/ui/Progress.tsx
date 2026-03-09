import React from "react";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max: number;
  srLabel?: string; // Optional accessible label
  showPercent?: boolean;
  heightClass?: string; // Tailwind height classes (e.g. h-2, h-3)
  roundedClass?: string; // Tailwind rounding (e.g. rounded-full)
  colorClass?: string; // Bar color
  animate?: boolean; // animate width change
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max,
  srLabel,
  showPercent = false,
  heightClass = "h-2",
  roundedClass = "rounded-full",
  colorClass = "bg-amber-700",
  animate = true,
  className = "",
  ...rest
}) => {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const label = srLabel || `Progres: ${Math.round(pct)}%`;
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
      className={`w-full bg-slate-200 ${heightClass} ${roundedClass} overflow-hidden ${className}`}
      {...rest}
    >
      <div
        className={`${colorClass} h-full ${animate ? "transition-all" : ""}`}
        style={{ width: `${pct}%` }}
      />
      {showPercent && (
        <span className="sr-only" aria-hidden={!srLabel}>
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
};
