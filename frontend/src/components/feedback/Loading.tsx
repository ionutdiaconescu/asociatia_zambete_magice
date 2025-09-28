interface LoadingProps {
  label?: string;
  rows?: number;
}
export function Loading({ label = "Se încarcă...", rows = 3 }: LoadingProps) {
  return (
    <div role="status" aria-live="polite" className="space-y-3">
      <p className="text-sm text-gray-500">{label}</p>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 w-full bg-gray-200 animate-pulse rounded" />
      ))}
    </div>
  );
}
