"use client";

import { AlertCircleIcon } from "lucide-react";

import "./globals.css";

export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center px-5 py-10 text-center">
          <div className="mb-6 flex justify-center">
            <div className="bg-surface p-5">
              <AlertCircleIcon className="h-12 w-12 text-muted-foreground" />
            </div>
          </div>
          <h1 className="type-display mb-2">Something went wrong</h1>
          <p className="type-body mb-8 max-w-md text-ink-muted">
            An unexpected error occurred. Please try again.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            className="type-control focus-ring inline-flex h-9 items-center justify-center bg-ink px-8 text-inverse transition-colors hover:bg-ink/80"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
