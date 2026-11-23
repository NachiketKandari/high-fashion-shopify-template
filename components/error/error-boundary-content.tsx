"use client";

import { AlertCircleIcon } from "lucide-react";

import { ErrorReporter } from "@/components/error/error-reporter";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";

interface ErrorBoundaryContentProps {
  error?: Error & { digest?: string };
  retry: () => void;
}

export function ErrorBoundaryContent({ error, retry }: ErrorBoundaryContentProps) {
  return (
    <>
      {error ? <ErrorReporter error={error} /> : null}
      <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
        <div className="mb-6 flex justify-center">
          <div className="bg-surface p-5">
            <AlertCircleIcon className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>
        <h1 className="type-display mb-2">Something went wrong</h1>
        <p className="type-body mb-8 max-w-md text-ink-muted">
          An unexpected error occurred. Please try again.
        </p>
        <div className="flex flex-col gap-2.5 tablet:flex-row">
          <Button onClick={() => retry()}>Try again</Button>
          <Button variant="outline" render={<Link href="/" />}>
            Go back to the home page
          </Button>
        </div>
      </div>
    </>
  );
}
