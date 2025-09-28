import { Button } from "../ui/Button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}
export function ErrorState({
  message = "A apărut o eroare.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="p-6 border border-red-200 bg-red-50 rounded-md text-sm text-red-700">
      <p className="font-medium mb-3">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Reîncearcă
        </Button>
      )}
    </div>
  );
}
