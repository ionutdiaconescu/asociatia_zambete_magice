import React from "react";
import { Spinner } from "./Spinner";
import { Alert } from "./Alert";

function isEmptyData<T>(data: T | null): boolean {
  if (!data) return true;
  if (Array.isArray(data)) return data.length === 0;
  return false;
}

interface ContentStateProps<T> {
  state: {
    data: T | null;
    loading: boolean;
    error: string | null;
    reload?: () => void;
  };
  skeleton?: React.ReactNode;
  children: (data: T) => React.ReactNode;
  empty?: React.ReactNode;
  ariaLabelLoading?: string;
}

export function ContentState<T>({
  state,
  skeleton,
  children,
  empty = <p className="text-sm text-gray-600">Nu există date.</p>,
  ariaLabelLoading = "Se încarcă conținutul",
}: ContentStateProps<T>) {
  const { data, loading, error, reload } = state;
  const hasEmptyData = isEmptyData(data);

  if (loading) {
    return (
      <div aria-busy="true" aria-label={ariaLabelLoading} className="space-y-4">
        {skeleton || <Spinner />}
      </div>
    );
  }
  if (error) {
    return (
      <Alert variant="error" title="Eroare" onRetry={reload}>
        {error}
      </Alert>
    );
  }
  if (hasEmptyData) return <>{empty}</>;
  return <>{children(data as T)}</>;
}
