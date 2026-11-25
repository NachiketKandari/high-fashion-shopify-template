"use client";

import { ErrorBoundaryContent } from "@/components/error/error-boundary-content";

export default function RootError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return <ErrorBoundaryContent error={error} retry={retry} />;
}
