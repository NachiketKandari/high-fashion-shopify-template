"use client";

import { ErrorBoundaryContent } from "@/components/error/error-boundary-content";

export default function AccountError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return <ErrorBoundaryContent error={error} retry={retry} />;
}
