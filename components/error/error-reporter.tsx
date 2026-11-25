"use client";

import { useEffect, useRef } from "react";

import { reportClientError } from "@/lib/observability/client";

interface ErrorReporterProps {
  error: Error & { digest?: string };
}

export function ErrorReporter({ error }: ErrorReporterProps) {
  const reported = useRef(false);

  useEffect(() => {
    if (reported.current) return;
    reported.current = true;
    reportClientError(error);
  }, [error]);

  return null;
}
