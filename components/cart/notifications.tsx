"use client";

import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { useCart } from "@/lib/cart/client";

const DISMISS_AFTER_MS = 5000;

export function CartNotifications() {
  const errorAt = useCart((state) =>
    state.errors.network.length > 0 ? state.errors.networkUpdatedAt : null,
  );
  const [dismissedAt, setDismissedAt] = useState<number | null>(null);

  useEffect(() => {
    if (errorAt === null) return;
    const timeout = setTimeout(() => setDismissedAt(errorAt), DISMISS_AFTER_MS);
    return () => clearTimeout(timeout);
  }, [errorAt]);

  if (errorAt === null || dismissedAt === errorAt) return null;

  return (
    <div
      className="type-body-sm fixed right-5 bottom-20 z-70 flex max-w-sm items-center gap-2.5 border border-error-rule bg-error-soft px-4 py-2.5 text-error-rule"
      role="alert"
    >
      <span>We couldn&apos;t update your cart. Please try again.</span>
      <button
        aria-label="Dismiss"
        className="focus-ring flex size-9 cursor-pointer items-center justify-center transition-opacity hover:opacity-60"
        onClick={() => setDismissedAt(errorAt)}
        type="button"
      >
        <XIcon className="size-4" />
      </button>
    </div>
  );
}
